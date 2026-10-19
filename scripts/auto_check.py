#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
官方标准自动核对器（建筑奖项认证速查）

流程：
  1. 读 data/facts.json（每个认证体系的"可机核事实"：官方来源 URL + 数值断言）
  2. 抓取官方原文（HTML / PDF），抽纯文本，命中缓存（data/cache）以保证可复现
  3. 逐条正则断言：命中 → pass；源码取到但断言不中 → fail（需人工复核）
     源码取不到 / PDF 解析失败 / 页面为空 → unverified（不臆断）
  4. 汇总写 data/audit.json，供网页读取展示；有 fail 时退出码 1（CI 报警）

用法：
  python scripts/auto_check.py                 # 联网抓取（默认缓存 7 天）
  python scripts/auto_check.py --offline       # 只用缓存（无缓存即 unverified）
  python scripts/auto_check.py --system leed --system breeam
  python scripts/auto_check.py --probe URL     # 只抓取并 dump 文本，调试断言用
  python scripts/auto_check.py --soft          # 有 fail 也返回 0
"""
import argparse
import hashlib
import html
import json
import os
import re
import sys
import time
import urllib.error
import urllib.request

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FACTS = os.path.join(ROOT, 'data', 'facts.json')
AUDIT = os.path.join(ROOT, 'data', 'audit.json')
CACHE = os.path.join(ROOT, 'data', 'cache')

UA = ('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 '
      '(KHTML, like Gecko) Chrome/124.0 Safari/537.36')
TIMEOUT = 30
RETRY = 2


# ---------- 抓取 ----------
def cache_key(url):
    return hashlib.sha1(url.encode('utf-8')).hexdigest()[:16]


def cache_path(url):
    return os.path.join(CACHE, cache_key(url) + '.json')


def html_to_text(raw):
    s = raw
    s = re.sub(r'(?is)<(script|style|noscript|svg)[^>]*>.*?</\1>', ' ', s)
    s = re.sub(r'(?is)<!--.*?-->', ' ', s)
    # 保留一定语义：块级标签转空格，避免 "40</td><td>50" 粘连
    s = re.sub(r'(?i)<br\s*/?>|</(p|div|li|tr|td|th|h[1-6]|section|article)>', ' ', s)
    s = re.sub(r'(?s)<[^>]+>', ' ', s)
    s = html.unescape(s)
    s = s.replace('\u00a0', ' ').replace('\u200b', '')
    s = re.sub(r'[ \t\r\f\v]+', ' ', s)
    s = re.sub(r'\n\s*\n+', '\n', s)
    return s.strip()


def pdf_to_text(binary):
    try:
        from pypdf import PdfReader  # type: ignore
    except Exception:
        try:
            from PyPDF2 import PdfReader  # type: ignore
        except Exception:
            return None, 'pdf-parser-missing'
    try:
        import io
        reader = PdfReader(io.BytesIO(binary))
        pages = min(len(reader.pages), 40)
        txt = []
        for i in range(pages):
            try:
                txt.append(reader.pages[i].extract_text() or '')
            except Exception:
                pass
        out = re.sub(r'[ \t]+', ' ', '\n'.join(txt))
        return out.strip(), None
    except Exception as e:  # noqa: BLE001
        return None, 'pdf-parse-error:%s' % type(e).__name__


def fetch(url, offline=False, max_age_days=7):
    """返回 dict(source, text|None, http, bytes, fetched_at, from_cache, error)"""
    cp = cache_path(url)
    cached = None
    if os.path.exists(cp):
        try:
            with open(cp, 'r', encoding='utf-8') as f:
                cached = json.load(f)
        except Exception:
            cached = None

    if cached:
        age = (time.time() - cached.get('ts', 0)) / 86400
        if offline or age < max_age_days:
            cached['from_cache'] = True
            cached['age_days'] = round(age, 1)
            return cached

    if offline:
        return {'url': url, 'text': None, 'http': None, 'bytes': 0,
                'fetched_at': None, 'from_cache': False,
                'error': 'offline-no-cache'}

    last_err = None
    for attempt in range(RETRY + 1):
        try:
            req = urllib.request.Request(url, headers={
                'User-Agent': UA,
                'Accept': 'text/html,application/xhtml+xml,application/pdf;q=0.9,*/*;q=0.8',
                'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
                'Accept-Encoding': 'gzip, deflate',
            })
            with urllib.request.urlopen(req, timeout=TIMEOUT) as r:
                raw = r.read(12 * 1024 * 1024)
                enc = (r.headers.get('Content-Encoding') or '').lower()
                if enc == 'gzip':
                    import gzip
                    raw = gzip.decompress(raw)
                elif enc == 'deflate':
                    import zlib
                    raw = zlib.decompress(raw, -zlib.MAX_WBITS)
                ctype = (r.headers.get('Content-Type') or '').lower()
                status = r.status
            error = None
            if 'pdf' in ctype or url.lower().endswith('.pdf') or raw[:4] == b'%PDF':
                text, error = pdf_to_text(raw)
            else:
                try:
                    text = html_to_text(raw.decode('utf-8', 'ignore'))
                except Exception:
                    text = html_to_text(raw.decode('gb18030', 'ignore'))
                if len(text) < 200:
                    error = 'page-too-short(maybe-js-rendered)'
            rec = {'url': url, 'text': text, 'http': status, 'bytes': len(raw),
                   'fetched_at': time.strftime('%Y-%m-%dT%H:%M:%S%z'),
                   'ts': time.time(), 'from_cache': False, 'error': error}
            os.makedirs(CACHE, exist_ok=True)
            with open(cp, 'w', encoding='utf-8') as f:
                json.dump(rec, f, ensure_ascii=False)
            return rec
        except urllib.error.HTTPError as e:
            last_err = 'http-%s' % e.code
            if e.code in (403, 404, 410):
                break
        except Exception as e:  # noqa: BLE001
            last_err = '%s:%s' % (type(e).__name__, str(e)[:40])
        time.sleep(1.2 * (attempt + 1))

    return {'url': url, 'text': None, 'http': None, 'bytes': 0,
            'fetched_at': None, 'from_cache': False, 'error': last_err or 'unknown'}


# ---------- 断言 ----------
def norm(s):
    return re.sub(r'\s+', ' ', s or '')


def run_fact(fact, text):
    """text 已归一化为单空格文本；返回 (status, evidence)"""
    if not text:
        return 'unverified', ''
    pats = fact.get('any') or ([fact['pattern']] if fact.get('pattern') else [])
    need = fact.get('all') or []
    ev = ''
    for p in pats:
        m = re.search(p, text, re.I)
        if m:
            ev = tidy(m.group(0))
            break
    if pats and not ev:
        return 'fail', ''
    for p in need:
        m = re.search(p, text, re.I)
        if not m:
            return 'fail', ev
        if not ev:
            ev = tidy(m.group(0))
    return 'pass', ev


def tidy(s, limit=160):
    s = re.sub(r'\s+', ' ', s).strip()
    return s[:limit]


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--offline', action='store_true')
    ap.add_argument('--max-age', type=int, default=7, help='缓存有效期（天）')
    ap.add_argument('--system', action='append', default=None)
    ap.add_argument('--probe', default=None, help='抓取该 URL 并打印文本片段')
    ap.add_argument('--probe-grep', default=None, help='配合 --probe 的关键词过滤')
    ap.add_argument('--soft', action='store_true')
    ap.add_argument('--out', default=AUDIT)
    args = ap.parse_args()

    if args.probe:
        rec = fetch(args.probe, offline=False)
        if rec.get('error') and not rec.get('text'):
            print('FETCH_ERROR', rec.get('error'))
            return 2
        text = norm(rec.get('text') or '')
        print('HTTP', rec.get('http'), 'BYTES', rec.get('bytes'), 'CHARS', len(text))
        if args.probe_grep:
            for kw in args.probe_grep.split('|'):
                idxs = [m.start() for m in re.finditer(re.escape(kw), text, re.I)][:3]
                print('--', kw, '->', len(idxs), 'hits')
                for i in idxs:
                    print('    …', tidy(text[max(0, i - 70):i + 90]))
        else:
            print(text[:3000])
        return 0

    with open(FACTS, 'r', encoding='utf-8') as f:
        facts = json.load(f)

    systems = facts['systems']
    if args.system:
        systems = [s for s in systems if s['id'] in set(args.system)]

    out_systems = []
    for s in systems:
        recs = []
        texts = []
        for src in s.get('sources', []):
            rec = fetch(src['url'], offline=args.offline, max_age_days=args.max_age)
            recs.append({
                'url': src['url'],
                'label': src.get('label', ''),
                'http': rec.get('http'),
                'bytes': rec.get('bytes'),
                'fetched_at': rec.get('fetched_at'),
                'from_cache': rec.get('from_cache', False),
                'error': rec.get('error'),
            })
            if rec.get('text'):
                texts.append(norm(rec['text']))
        text = '\n'.join(texts)

        fact_rows = []
        if s.get('manual') or not s.get('facts'):
            status = 'manual'
        else:
            for fact in s['facts']:
                st, ev = run_fact(fact, text)
                fact_rows.append({'id': fact.get('id'), 'label': fact['label'],
                                  'status': st, 'evidence': ev,
                                  'mirror': fact.get('expect')})
            states = [f['status'] for f in fact_rows]
            if 'fail' in states:
                status = 'fail'
            elif states and all(x == 'pass' for x in states):
                status = 'pass'
            else:
                status = 'unverified'

        out_systems.append({
            'id': s['id'],
            'abbr': s.get('abbr', s['id']),
            'name': s.get('name', s['id']),
            'status': status,
            'auto_checked': status in ('pass', 'fail'),
            'sources': recs,
            'facts': fact_rows,
        })

    summary = {k: sum(1 for s in out_systems if s['status'] == k)
               for k in ('pass', 'fail', 'unverified', 'manual')}
    summary['total'] = len(out_systems)
    audit = {
        'generated_at': time.strftime('%Y-%m-%d %H:%M:%S'),
        'generated_at_iso': time.strftime('%Y-%m-%dT%H:%M:%S%z'),
        'generator': 'auto_check.py',
        'mode': 'offline' if args.offline else 'live',
        'summary': summary,
        'systems': out_systems,
    }
    os.makedirs(os.path.dirname(args.out), exist_ok=True)
    with open(args.out, 'w', encoding='utf-8') as f:
        json.dump(audit, f, ensure_ascii=False, indent=2)

    print('audit ->', os.path.relpath(args.out, ROOT))
    print('summary: pass={pass} fail={fail} unverified={unverified} manual={manual} total={total}'.format(**summary))
    for s in out_systems:
        flag = {'pass': 'OK  ', 'fail': 'FAIL', 'unverified': '??  ', 'manual': '--  '}[s['status']]
        detail = ''
        bad = [f['label'] for f in s['facts'] if f['status'] != 'pass']
        if s['status'] == 'fail':
            detail = ' | 未命中: ' + '; '.join(bad[:3])
        elif s['status'] == 'unverified':
            errs = [x['error'] for x in s['sources'] if x.get('error')]
            detail = ' | ' + (', '.join(errs[:2]) or '无可用原文')
        print('  [%s] %-10s %s%s' % (flag, s['abbr'], s['status'], detail))

    if summary['fail'] and not args.soft:
        return 1
    return 0


if __name__ == '__main__':
    sys.exit(main())

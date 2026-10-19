#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
建筑奖项认证速查 · 官方来源自动核对器

三层核对（前两层在浏览器里即时跑，这一层负责"官方侧"）：
  L1 页面自检      → 浏览器加载即校验内部一致性（权重合计、阈值单调、等级表与计算器一致…）
  L2 基准比对      → 浏览器把 app.js 数值与 data/facts.json（核对基准）逐项比对
  L3 官方源巡检    → 本脚本抓取官方原文，比对内容指纹：变了/取不到/正常，写 data/audit.json

判定口径（不臆断）：
  ok           官方源可访问，正文指纹与上次基线一致
  changed      官方源正文指纹变化（可能出新版/改版）→ 需要人工确认后更新基准
  archived     线上抓取失败，但本地存档的官方原文 sha256 一致（离线可比对）
  unreachable  抓取失败且无存档（403/404/超时/JS 渲染）→ 转人工
  no_source    该体系无可机读官方源（PDF/动态页），只做人工核对
  seeded       首次抓取，已建立指纹基线

用法：
  python scripts/auto_check.py                    # 联网巡检（缓存 7 天）
  python scripts/auto_check.py --offline          # 只用本地缓存（CI 断网自测）
  python scripts/auto_check.py --accept-changes   # 把当前指纹写为基线（人工确认后执行）
  python scripts/auto_check.py --probe URL        # 调试：抓取并打印正文
  python scripts/auto_check.py --soft             # 有 changed/unreachable 也返回 0
退出码：0 正常；1 存在 changed（需人工）；2 抓取全失败。
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
STATE = os.path.join(ROOT, 'data', 'source_state.json')
CACHE = os.path.join(ROOT, 'data', 'cache')

UA = ('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 '
      '(KHTML, like Gecko) Chrome/124.0 Safari/537.36')
TIMEOUT = 45
RETRY = 2


def _open(req, insecure=False):
    if insecure:
        import ssl
        ctx = ssl.create_default_context()
        ctx.check_hostname = False
        ctx.verify_mode = ssl.CERT_NONE
        return urllib.request.urlopen(req, timeout=TIMEOUT, context=ctx)
    return urllib.request.urlopen(req, timeout=TIMEOUT)


# ---------------- 抓取 ----------------
def cache_path(url):
    return os.path.join(CACHE, hashlib.sha1(url.encode()).hexdigest()[:16] + '.json')


def html_to_text(raw):
    s = re.sub(r'(?is)<(script|style|noscript|svg)[^>]*>.*?</\1>', ' ', raw)
    s = re.sub(r'(?is)<!--.*?-->', ' ', s)
    s = re.sub(r'(?i)<br\s*/?>|</(p|div|li|tr|td|th|h[1-6]|section|article)>', ' ', s)
    s = re.sub(r'(?s)<[^>]+>', ' ', s)
    s = html.unescape(s).replace('\u00a0', ' ').replace('\u200b', '')
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
        parts = []
        for i in range(min(len(reader.pages), 30)):
            try:
                parts.append(reader.pages[i].extract_text() or '')
            except Exception:
                pass
        return re.sub(r'[ \t]+', ' ', '\n'.join(parts)).strip(), None
    except Exception as e:  # noqa: BLE001
        return None, 'pdf-parse-error:%s' % type(e).__name__


def fetch(url, offline=False, max_age_days=7):
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
                'fetched_at': None, 'from_cache': False, 'error': 'offline-no-cache'}

    last = None
    insecure = False
    for attempt in range(RETRY + 1):
        try:
            req = urllib.request.Request(url, headers={
                'User-Agent': UA,
                'Accept': 'text/html,application/xhtml+xml,application/pdf;q=0.9,*/*;q=0.8',
                'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
                'Accept-Encoding': 'gzip, deflate',
            })
            with _open(req, insecure) as r:
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
            err = None
            if 'pdf' in ctype or url.lower().split('?')[0].endswith('.pdf') or raw[:4] == b'%PDF':
                text, err = pdf_to_text(raw)
            else:
                text = html_to_text(raw.decode('utf-8', 'ignore'))
                if len(text) < 300:
                    err = 'page-too-short(maybe-js)'
            rec = {'url': url, 'text': text, 'http': status, 'bytes': len(raw),
                   'fetched_at': time.strftime('%Y-%m-%dT%H:%M:%S%z'),
                   'ts': time.time(), 'from_cache': False, 'error': err,
                   'ssl_unverified': insecure}
            os.makedirs(CACHE, exist_ok=True)
            with open(cp, 'w', encoding='utf-8') as f:
                json.dump(rec, f, ensure_ascii=False)
            return rec
        except urllib.error.HTTPError as e:
            last = 'http-%s' % e.code
            if e.code in (401, 403, 404, 410):
                break
        except Exception as e:  # noqa: BLE001
            msg = str(e)
            last = '%s:%s' % (type(e).__name__, msg[:40])
            if 'CERTIFICATE_VERIFY_FAILED' in msg and not insecure:
                insecure = True       # 部分政府/机构站点证书链不全，降级重试一次
                continue
        time.sleep(1.0 * (attempt + 1))
    return {'url': url, 'text': None, 'http': None, 'bytes': 0,
            'fetched_at': None, 'from_cache': False, 'error': last or 'unknown'}


def fingerprint(text):
    """正文指纹：抹掉时间戳/空白后取 SHA-256，降低无意义抖动"""
    t = re.sub(r'\s+', ' ', text or '').strip().lower()
    t = re.sub(r'\b\d{4}-\d{2}-\d{2}\b', '', t)
    return hashlib.sha256(t.encode('utf-8')).hexdigest()[:16]


# ---------------- 主流程 ----------------
def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--offline', action='store_true')
    ap.add_argument('--max-age', type=int, default=7)
    ap.add_argument('--system', action='append')
    ap.add_argument('--probe')
    ap.add_argument('--accept-changes', action='store_true')
    ap.add_argument('--soft', action='store_true')
    ap.add_argument('--out', default=AUDIT)
    args = ap.parse_args()

    if args.probe:
        rec = fetch(args.probe)
        if not rec.get('text'):
            print('FETCH_FAIL', rec.get('http'), rec.get('error'))
            return 2
        t = re.sub(r'\s+', ' ', rec['text'])
        print('HTTP', rec.get('http'), 'BYTES', rec.get('bytes'), 'CHARS', len(t))
        print('HASH', fingerprint(rec['text']))
        print(t[:2500])
        return 0

    with open(FACTS, 'r', encoding='utf-8') as f:
        facts = json.load(f)
    state = {'urls': {}}
    if os.path.exists(STATE):
        try:
            with open(STATE, 'r', encoding='utf-8') as f:
                state = json.load(f)
        except Exception:
            pass
    state.setdefault('urls', {})

    systems = facts['systems']
    if args.system:
        systems = [s for s in systems if s['id'] in set(args.system)]

    by_id = {s['id']: s for s in systems}
    rows = []
    for s in systems:
        recs, hashes = [], []
        for url in s.get('sources', []):
            rec = fetch(url, offline=args.offline, max_age_days=args.max_age)
            h = fingerprint(rec.get('text')) if rec.get('text') else None
            base = (state['urls'].get(url) or {}).get('hash')
            changed = bool(h and base and h != base)
            recs.append({
                'url': url,
                'http': rec.get('http'),
                'bytes': rec.get('bytes'),
                'error': rec.get('error'),
                'fetched_at': rec.get('fetched_at'),
                'from_cache': rec.get('from_cache', False),
                'hash': h,
                'baseline_hash': base,
                'changed': changed,
                'ssl_unverified': rec.get('ssl_unverified', False),
            })
            if h:
                hashes.append((url, h))

        ok_recs = [r for r in recs if r.get('hash')]
        if not s.get('sources'):
            status = 'no_source'
        elif any(r['changed'] for r in recs):
            status = 'changed'
        elif not ok_recs:
            status = 'unreachable'
        elif all(r['baseline_hash'] for r in ok_recs):
            status = 'ok'
        else:
            status = 'seeded'
        partial = bool(recs) and len(ok_recs) < len(recs)

        # 线上抓不到时的兜底：比对本地存档的官方原文（sha256）
        arch = s.get('archive') or None
        if status == 'unreachable' and arch:
            ap = arch.get('file') or ''
            full = ap if os.path.isabs(ap) else os.path.join(ROOT, ap.replace('/', os.sep))
            info = {'file': ap, 'url': arch.get('url'), 'expect': arch.get('sha256'),
                    'bytes': None, 'sha256': None, 'ok': False, 'note': arch.get('note')}
            try:
                with open(full, 'rb') as f:
                    blob = f.read()
                info['bytes'] = len(blob)
                info['sha256'] = hashlib.sha256(blob).hexdigest()
                info['ok'] = bool(info['expect']) and info['sha256'] == info['expect']
            except Exception as e:  # noqa: BLE001
                info['error'] = '%s:%s' % (type(e).__name__, str(e)[:40])
            if info['ok']:
                status = 'archived'
            for r in recs:
                r['archive'] = info

        if args.accept_changes:
            for url, h in hashes:
                state['urls'][url] = {'hash': h, 'ts': time.time(),
                                      'accepted_at': time.strftime('%Y-%m-%d'), 'system': s['id']}

        rows.append({
            'id': s['id'],
            'abbr': s.get('abbr', s['id']),
            'status': status,
            'partial': partial,
            'checked_at': s.get('checked_at'),
            'method': s.get('method'),
            'manual': s.get('manual_review'),
            'archive': s.get('archive'),
            'sources': recs,
        })

    if args.accept_changes:
        state['updated_at'] = time.strftime('%Y-%m-%d %H:%M:%S')
        with open(STATE, 'w', encoding='utf-8') as f:
            json.dump(state, f, ensure_ascii=False, indent=2)

    # 基准年龄
    try:
        from datetime import date
        y, m, d = [int(x) for x in facts.get('baseline_updated', '2026-01-01').split('-')]
        age = (date.today() - date(y, m, d)).days
    except Exception:
        age = 0
    max_age = facts.get('max_age_days', 45)

    keys = ('ok', 'archived', 'changed', 'unreachable', 'no_source', 'seeded')
    summary = {k: sum(1 for r in rows if r['status'] == k) for k in keys}
    summary['total'] = len(rows)

    audit = {
        'generated_at': time.strftime('%Y-%m-%d %H:%M:%S'),
        'generated_at_iso': time.strftime('%Y-%m-%dT%H:%M:%S%z'),
        'generator': 'auto_check.py · L3 官方源巡检',
        'mode': 'offline' if args.offline else 'live',
        'baseline_updated': facts.get('baseline_updated'),
        'baseline_age_days': age,
        'max_age_days': max_age,
        'baseline_expired': age > max_age,
        'summary': summary,
        'systems': rows,
    }
    os.makedirs(os.path.dirname(args.out), exist_ok=True)
    with open(args.out, 'w', encoding='utf-8') as f:
        json.dump(audit, f, ensure_ascii=False, indent=2)

    print('audit ->', os.path.relpath(args.out, ROOT))
    print('baseline age %d 天（上限 %d）%s' % (age, max_age, '  ⚠ 已过期' if age > max_age else ''))
    print('summary: ' + '  '.join('%s=%d' % (k, summary[k]) for k in keys))
    icon = {'ok': '✓', 'archived': '▣', 'changed': '△', 'unreachable': '!', 'no_source': '·', 'seeded': '+'}
    for r in rows:
        extra = ''
        if r['status'] == 'unreachable':
            extra = ' | ' + ', '.join(x['error'] or '?' for x in r['sources'])[:70]
        elif r['status'] == 'changed':
            extra = ' | 官方正文指纹变化，需人工确认'
        print('  %s %-10s %-12s%s' % (icon[r['status']], r['abbr'], r['status'], extra))

    if summary['changed'] and not args.soft:
        return 1
    if summary['unreachable'] == summary['total'] and rows:
        return 2
    return 0


if __name__ == '__main__':
    sys.exit(main())

# -*- coding: utf-8 -*-
import json, io, re

ZH = {
'A01':'空气质量','A02':'无烟环境','A03':'通风设计','A04':'施工污染管理','A05':'提升空气质量',
'A06':'提升通风设计','A07':'可开启外窗','A08':'空气质量监测与告知','A09':'污染渗入管理',
'A10':'燃烧源最小化','A11':'污染源隔离','A12':'空气过滤','A13':'提升送风品质','A14':'微生物与霉菌控制',
'W01':'水质指标','W02':'饮用水水质','W03':'基本水管理','W04':'提升水质','W05':'饮用水质量管理',
'W06':'饮水促进','W07':'潮湿管理','W08':'卫生支持','W09':'现场非饮用水回用',
'N01':'果蔬供应','N02':'营养信息透明','N03':'精制成分限制','N04':'食品广告','N05':'人工添加剂',
'N06':'份量控制','N07':'营养教育','N08':'正念饮食','N09':'特殊膳食','N10':'食物制备',
'N11':'负责任食物采购','N12':'食物生产','N13':'本地食物环境','N14':'红肉与加工肉',
'L01':'光照暴露','L02':'视觉照明设计','L03':'昼夜节律照明设计','L04':'电光源眩光控制',
'L05':'天然采光策略','L06':'采光模拟','L07':'视觉平衡','L08':'电光源品质','L09':'使用者照明控制',
'V01':'活力建筑与社区','V02':'人体工学工位设计','V03':'通行网络','V04':'活力配套设施',
'V05':'场地规划与选址','V06':'身体活动机会','V07':'活动家具','V08':'活动空间与器材',
'V09':'身体活动促进','V10':'自我监测','V11':'人体工学计划',
'T01':'热工性能','T02':'热舒适验证','T03':'分区温控','T04':'个人温控','T05':'辐射热舒适',
'T06':'热舒适监测','T07':'湿度控制','T08':'提升可开启外窗','T09':'室外热舒适',
'S01':'声环境测绘','S02':'最大噪声级','S03':'隔声屏障','S04':'混响时间','S05':'吸声表面',
'S06':'最小背景声','S07':'撞击声管理','S08':'提升音频设备','S09':'听力健康保护',
'X01':'材料限制','X02':'室内危险材料管理','X03':'铬化砷酸铜与铅管理','X04':'场地修复',
'X05':'提升材料限制','X06':'VOC 限制','X07':'材料透明度','X08':'材料优化','X09':'废弃物管理',
'X10':'虫害与农药管理','X11':'清洁产品与规程','X12':'接触减少','X13':'建材公平劳工',
'M01':'心理健康促进','M02':'自然与场所','M03':'心理健康服务','M04':'心理健康教育','M05':'压力管理',
'M06':'恢复机会','M07':'恢复空间','M08':'恢复活动','M09':'提升自然接触','M10':'戒烟支持','M11':'物质使用支持',
'C01':'健康福祉促进','C02':'整合设计','C03':'应急准备','C04':'使用者调查','C05':'提升使用者调查',
'C06':'健康服务与福利','C07':'提升健康促进','C08':'新生儿父母支持','C09':'新妈妈支持','C10':'家庭支持',
'C11':'公众参与','C12':'人才招聘与员工行动计划','C13':'无障碍与通用设计','C14':'应急资源',
'C15':'应急韧性与恢复','C16':'可负担住房','C17':'负责任劳工实践','C18':'家暴受害者支持',
'C19':'教育与支持','C20':'历史承认','C21':'多感官设计',
'I01':'创新实践（WELL）','I02':'WELL AP 专业人士','I03':'体验 WELL 认证','I04':'健康门户',
'I05':'绿色建筑评级对接','I06':'碳披露与减排',
}
ZH_C = {'Air':'空气','Water':'水','Nourishment':'营养','Light':'光','Movement':'运动',
        'Thermal Comfort':'热舒适','Sound':'声环境','Materials':'材料','Mind':'精神',
        'Community':'社区','Innovation':'创新'}

d = json.load(io.open('.tmp/well229.json', encoding='utf-8'))
groups, rows = [], []
for c in d:
    code = (c['feature_prefix'] or '').strip()
    items = []
    p = o = 0; pts = 0
    for f in c['features']:
        m = re.match(r'^([A-Z]\d{2})\s*(.*)$', f['feature_full_name'].replace('\u03b2', '').strip())
        fc = m.group(1) if m else f['feature_full_name'][:3]
        beta = ('\u03b2' in f['feature_full_name']) or ('\u03b2' in (f.get('name') or '')) or ('\u03d0' in f['feature_full_name'])
        zh = ZH.get(fc, '')
        if f['type'] == 'P': p += 1
        else: o += 1
        pts += f.get('max_points') or 0
        items.append([fc, zh + ' ' + f['name'].replace('\u03b2', '').strip(), f['type'],
                      f.get('max_points') or 0, 1 if beta else 0])
    nm = ZH_C.get(c['name'], c['name'])
    label = '%s %s' % (nm, c['name'])
    if code: label += '（%s）' % code
    groups.append({'name': label, 'p': p, 'o': o, 'pts': pts, 'items': items})
    if c['name'] != 'Innovation':
        rows.append([label, p, o, pts, 12])
    else:
        rows.append([label, p, o, pts, 10])

def js_str(v):
    if isinstance(v, str):
        return "'" + v.replace('\\', '\\\\').replace("'", "\\'") + "'"
    if isinstance(v, bool):
        return 'true' if v else 'false'
    if v is None: return 'null'
    if isinstance(v, list): return '[' + ','.join(js_str(x) for x in v) + ']'
    if isinstance(v, dict):
        return '{' + ','.join('%s:%s' % (k if re.match(r'^[A-Za-z_]\w*$', k) else js_str(k), js_str(x)) for k, x in v.items()) + '}'
    return str(v)

out = []
out.append("  detail:{")
out.append("    title:'细项指标 · 概念特性构成',")
out.append("    cap:12,")
out.append("    capNote:'每概念计入总分上限 12 分；概念内可选分值超出 12 分时，超出部分计入 I01 创新分（创新合计上限 10 分）。',")
out.append("    cols:['概念','先决条件 P','优化条件 O','可选分合计','计入上限'],")
out.append("    rows:" + js_str(rows) + ",")
out.append("    note:'数据取自 WELL 官方数字化标准接口（WELL v2 Q2 2025，版本 id 229）的全部概念与特性（Feature）。P=先决条件，必须全部达成且不计分；O=优化条件，按官方分值计分；标 β 者为试行（beta）特性。中文名为官方英文名的译名，申报以英文原文为准。',")
out.append("    groups:[")
for g in groups:
    out.append("      {name:%s,p:%d,o:%d,pts:%d,items:%s}," % (js_str(g['name']), g['p'], g['o'], g['pts'], js_str(g['items'])))
out.append("    ]")
out.append("  },")
txt = '\n'.join(out)
io.open('.tmp/well_detail.js', 'w', encoding='utf-8').write(txt)
print('lines', txt.count('\n') + 1, 'bytes', len(txt.encode('utf-8')))
print(txt[:600])

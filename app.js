/* ============================================================
   建筑奖项认证速查 · 数据与渲染
   说明：各体系分值/权重按公开资料概化，正式申报以官方为准
   ============================================================ */

const CATS = [
  { id:'green',  name:'绿色建筑可持续认证', color:'var(--green)',  bg:'var(--green-bg)',
    intro:'对标 LEED 的环境 / 能耗 / 碳排赛道，关注建筑全生命期的可持续性能。' },
  { id:'health', name:'健康建筑认证',        color:'var(--health)', bg:'var(--health-bg)',
    intro:'对标 WELL，侧重室内人居健康：空气、水、光、热舒适、健身与人文。' },
  { id:'spec',   name:'专项建筑认证',        color:'var(--spec)',   bg:'var(--spec-bg)',
    intro:'单项高性能认证（超低能耗、实测运行能效、可持续场地等），常与 LEED / WELL 叠加申报。' }
];

/* ---------- 数据 ----------
   calc.type:
   items   → 多指标输入（max 各自封顶），按总分或百分比定级
   total   → 单一总分输入
   gbt50378→ 国标绿建专用（控制项400分+五类评分项+加分）
   health  → 健康建筑专用（六类加权+加分）
   check   → 复选达标式（EDGE / PHI / LBC / HSR 等），result(checked) 返回结果
   nabers  → 星级滑杆
--------------------------------------------------------------- */
const SYSTEMS = [

/* ================= 一、绿色建筑可持续认证 ================= */
{
  id:'leed', cat:'green', abbr:'LEED', name:'LEED（能源与环境设计先锋）',
  region:'美国 · USGBC / GBCI', tag:'全球应用最广',
  tagline:'建筑对地球友好（环境可持续），国内大批外资与高端项目的默认对齐体系。',
  src:{ doc:'LEED v4.1 BD+C 评分表 / LEED v5（新建项目现行注册版本）', ver:'v4.1 · v5', org:'USGBC / GBCI',
        url:'https://www.usgbc.org/leed/v41', checked:'2026-10-19', status:'verified',
        note:'2026 年起 LEED v5 为新建项目现行注册版本，v4.1 仍接受既有项目完成认证；两版总分同为 110 分，v5 强化运行碳/隐含碳与韧性。' },
  apply:[
    '在 GBCI 官网<b>注册项目</b>并选定体系版本（LEED v4 / v4.1）与评价体系（BD+C 新建、O+M 运营、ID+C 室内等）；',
    '聘请 <b>LEED AP</b> 专业人员或顾问团队，进行目标等级可行性分析；',
    '按得分点收集设计说明、计算书、模拟报告等<b>证明文件</b>，设计阶段可先做<b>预评</b>（Split Review）；',
    '施工完成后提交最终材料，GBCI 通常分两轮<b>技术审核</b>并出具审核意见；',
    '审核通过后签发证书，等级由总分确定（满分 110 分）。'
  ],
  levels:[
    {name:'Certified 认证级', range:'40–49 分', desc:'基础达标'},
    {name:'Silver 银级',      range:'50–59 分', desc:'常见于外企楼宇'},
    {name:'Gold 金级',        range:'60–79 分', desc:'高端项目主流目标'},
    {name:'Platinum 铂金级',  range:'≥80 分',   desc:'行业标杆'}
  ],
  indicators:[
    ['选址与交通 LT',16],['可持续场地 SS',10],['节水 WE',11],['能源与大气 EA',33],
    ['材料与资源 MR',13],['室内环境质量 EQ',16],['整合过程 IP',1],['创新 IN',6],['区域优先 RP',4]
  ],
  scoring:[
    '各得分点分值累加，无权重折算；EA（能源与大气）占比最高，是拉开等级差距的关键；',
    '若干<b>先决条件（Prerequisites）</b>必须全部满足方可计分；',
    '可叠加<b>创新得分</b>与区域优先得分冲高等级。'
  ],
  calc:{ type:'items', unit:'分', total:110, note:'满分 110 分；需先满足全部先决条件。',
    thresholds:[{min:40,lvl:'Certified'},{min:50,lvl:'Silver 银级'},{min:60,lvl:'Gold 金级'},{min:80,lvl:'Platinum 铂金级'}] }
},
{
  id:'breeam', cat:'green', abbr:'BREEAM', name:'BREEAM',
  region:'英国 · BRE', tag:'全球最早',
  tagline:'全球最早的绿色建筑评估体系，侧重全生命期：生态、韧性。',
  src:{ doc:'BREEAM UK New Construction 2018 技术手册（SD5078）', ver:'2018 / 手册 v6', org:'BRE Global',
        url:'https://files.bregroup.com/breeam/technicalmanuals/NC2018/content/', checked:'2026-10-19', status:'verified',
        note:'权重随评估范围（全装修/简单建筑/壳与核/仅壳）变化；本页取"全装修 fully fitted out"口径。BRE 另有 BREEAM V7（2024）新版，注册时以官网现行版本为准。' },
  apply:[
    '在 BRE 项目系统<b>注册</b>，确定评价方案（New Construction / In-Use / Refurbishment）；',
    '聘请持证 <b>BREEAM 评估师（Assessor）</b>开展评估；',
    '进行<b>设计阶段评估（Design Stage）</b>可先获临时证书；',
    '竣工后进行<b>最终评估（Post-Construction）</b>，提交证据材料；',
    'BRE 质量审核抽查后签发正式证书。'
  ],
  levels:[
    {name:'Pass 通过',       range:'≥30%',  desc:'最低门槛'},
    {name:'Good 良好',       range:'≥45%',  desc:'常规实践'},
    {name:'Very Good 很好',  range:'≥55%',  desc:'欧洲项目主流'},
    {name:'Excellent 优秀',  range:'≥70%',  desc:'大型基金持有项目常要求'},
    {name:'Outstanding 卓越',range:'≥85%',  desc:'示范级'}
  ],
  indicators:[
    ['管理 Management',11],['健康与福祉',14],['能源',16],['交通',10],['水',7],
    ['材料',15],['废弃物',6],['土地利用与生态',13],['污染',8]
  ],
  scoring:[
    '各章节得分率按<b>权重</b>加权成总分百分比，另可加创新分（最高 10%）；',
    '权重按评估范围分四套口径（全装修 / 简单建筑 / 壳与核 / 仅壳），本页取全装修口径；',
    '每个等级设有<b>强制最低得分（Minimum Standards）</b>，总分够但关键项不足会被压级；',
    'BRE 已发布 BREEAM V7（2024），新版对齐净零碳路径，注册前须确认适用版本。'
  ],
  calc:{ type:'items', unit:'%', percent:true, note:'按加权得分率定级；每个等级另设强制最低分。',
    thresholds:[{min:30,lvl:'Pass'},{min:45,lvl:'Good'},{min:55,lvl:'Very Good'},{min:70,lvl:'Excellent'},{min:85,lvl:'Outstanding'}] }
},
{
  id:'dgnb', cat:'green', abbr:'DGNB', name:'DGNB',
  region:'德国 · DGNB 协会', tag:'综合可持续',
  tagline:'德国可持续建筑，强调经济、生态、社会三位一体的全生命期，欧洲高端项目常用，不是单纯拼节能。',
  src:{ doc:'DGNB System – New Buildings（评分与等级规则）', ver:'2023 版', org:'DGNB e.V.',
        url:'https://www.dgnb-system.de/en/', checked:'', status:'pending',
        note:'六维权重与 35/50/65/80 分数线为通用口径，DGNB 各建筑类型模块权重略有差异，待逐册核对官方评分表。' },
  apply:[
    '在 DGNB <b>注册项目</b>并选定建筑类型模块（办公、住宅、混合等）；',
    '委托 DGNB 授权的<b>审核顾问（Auditor）</b>全程负责文件与送审；',
    '可选进行<b>预认证（Pre-Certificate）</b>锁定目标等级；',
    '施工完成后提交全套计算与证明文档，由 DGNB 认证委员会审核；',
    '审核通过后授证（证书含各维度等级徽章）。'
  ],
  levels:[
    {name:'Bronze 铜',    range:'≥35%', desc:'基础'},
    {name:'Silver 银',    range:'≥50%', desc:'常规'},
    {name:'Gold 金',      range:'≥65%', desc:'欧洲高端主流'},
    {name:'Platinum 铂金',range:'≥80%', desc:'顶级'}
  ],
  indicators:[
    ['环境质量',22.5],['经济质量',22.5],['社会文化与功能质量',22.5],
    ['技术质量',12.5],['流程质量',12.5],['场地质量',7.5]
  ],
  scoring:[
    '200 余条指标按六维加权，折算成<b>总分百分比</b>定级；',
    '各维度另有<b>最低分要求</b>（如技术质量不得低于其满分的一半），防止偏科；',
    '全生命期成本（LCC）、生命周期评估（LCA）是 DGNB 特有的硬性计算项。'
  ],
  calc:{ type:'items', unit:'%', percent:true, note:'六维加权得分率定级；各维度另设最低分线。',
    thresholds:[{min:35,lvl:'Bronze 铜'},{min:50,lvl:'Silver 银'},{min:65,lvl:'Gold 金'},{min:80,lvl:'Platinum 铂金'}] }
},
{
  id:'greenmark', cat:'green', abbr:'GM', name:'Green Mark',
  region:'新加坡 · BCA 建设局', tag:'热带气候标杆',
  tagline:'热带气候建筑基准，东南亚标杆，国内外很多外资项目会做。',
  src:{ doc:'Green Mark 2021 Certification Standard（第 2/3 版）', ver:'GM:2021', org:'BCA 新加坡建设局',
        url:'https://www1.bca.gov.sg/docs/default-source/docs-corp-buildsg/sustainability/20240101_certification_standard_r2.pdf',
        checked:'2026-10-19', status:'verified',
        note:'GM:2021 已改按"相对 2005 基线的节能率"分档（非百分制）；Gold 档仅适用于 In-Operation 复评项目，新建项目从 GoldPLUS 起评。' },
  apply:[
    '向新加坡建设局（BCA）<b>提交申请</b>，选定新建 / 重大改造（Full GM:2021）或 In-Operation 复评轨道；',
    '<b>能源效率是唯一先决条件</b>，须从三条路径选一：EUI 实测强度、Fixed Metrics 分项指标、或 Energy Savings 模型对比；',
    '在智慧化、健康与福祉、全生命期碳、可维护性、韧性五个章节得分（单节 ≥10 分可获该章节徽章）；',
    '竣工或运行数据核验后授证；可叠加 <b>SLE</b>（超低能耗）、<b>ZE</b>（零能耗）、<b>PE</b>（正能耗）标识；',
    '有效期通常 3 年，到期复评。'
  ],
  levels:[
    {name:'Certified', range:'节能 10–25%', desc:'最低合规档'},
    {name:'Gold', range:'节能 25–45%', desc:'仅 In-Operation 复评项目适用'},
    {name:'GoldPLUS', range:'节能 45–60%', desc:'新建项目主流目标'},
    {name:'Platinum / SLE', range:'节能 ≥60%', desc:'最高档，SLE 与铂金同门槛'},
    {name:'ZE / PE（进阶标识）', range:'100% / 115% 可再生能源覆盖', desc:'零能耗 / 正能耗'}
  ],
  indicators:[
    ['能源效率（唯一先决条件，三条路径）',1],['智慧化 Intelligence',1],['健康与福祉 Health & Well-being',1],
    ['全生命期碳 Whole Life Carbon',1],['可维护性 Maintainability',1],['韧性 Resilience',1]
  ],
  scoring:[
    '等级不看累加总分，而看<b>相对 2005 基线（或现行规范）的节能率</b>：10% / 25% / 45% / 60% 四道门槛；',
    '节能率由 EUI 实测、分项指标（围护 OTTV/EUTV、空调系统效率等）或能耗模型三种路径之一证实；',
    '其余五章节为加分项：<b>单节 ≥10 分</b>授予该章节徽章，满分项目可到 40 分（GoldPLUS 30 分）；',
    'SLE 需节能 ≥60%（或相对现行规范 40%）；ZE 需 100%、PE 需 115% 能耗由可再生能源覆盖。'
  ],
  calc:{ type:'total', unit:'%', total:100, label:'相对 2005 基线的节能率（%）',
    note:'按 GM:2021 节能率分档；新建项目 Gold 档不适用，实际从 GoldPLUS 起评。',
    thresholds:[{min:10,lvl:'Certified'},{min:25,lvl:'Gold（仅复评）'},{min:45,lvl:'GoldPLUS'},{min:60,lvl:'Platinum / SLE'}] }
},
{
  id:'beam', cat:'green', abbr:'BEAM', name:'BEAM Plus',
  region:'中国香港 · HKGBC / BSL', tag:'大湾区主流',
  tagline:'香港绿色建筑认证，内地大湾区项目高度使用。',
  src:{ doc:'BEAM Plus New Buildings v2.0 评估手册（2021 / 2025 修订）', ver:'NB v2.0', org:'HKGBC / BEAM Society',
        url:'https://www.hkgbc.org.hk/eng/beam-plus/beam-plus-references/manuals-assessment/ManualsFiles/BEAMPlus-NBV2-2021-EN.pdf',
        checked:'2026-10-19', status:'verified',
        note:'官方规定：须满足全部先决条件（Prerequisites），且每类得分不低于 20%，总分 ≥75% 方可获铂金级。' },
  apply:[
    '向香港绿建议会（HKGBC）<b>注册</b>项目并选定版本（NB 新建 / EB 既有）；',
    '聘请 <b>BEAM Pro</b> 专业人士统筹评估；',
    '按 SS / MAT / EU / WU / IEQ 等类别准备得分文件；',
    '提交独立评估机构<b>两阶段评审</b>（暂定评估 + 最终评估）；',
    '通过后由 HKGBC 授证。'
  ],
  levels:[
    {name:'Bronze 铜级',  range:'≥40%', desc:'入门'},
    {name:'Silver 银级',  range:'≥55%', desc:'常规'},
    {name:'Gold 金级',    range:'≥65%', desc:'主流目标'},
    {name:'Platinum 铂金级',range:'≥75%', desc:'标杆'}
  ],
  indicators:[
    ['综合设计与建造管理 IDCM',18],['可持续场地 SS',15],['材料与废弃物 MW',9],
    ['能源使用 EU',29],['用水 WU',7],['健康与福祉 HWB',22]
  ],
  scoring:[
    '按各类别得分占可得学分的百分比<b>加权汇总</b>（权重合计 100%）定级；',
    '官方硬性要求：满足<b>全部先决条件</b>，且<b>每类得分 ≥20%</b>，否则不予评级；',
    '加分学分（BONUS）按 1.2 倍计入所属类别；创新类（IA）最多可提交 10 个学分；',
    '权重来自 BEAM Plus NB v2.0 手册表 1（IDCM 18 / SS 15 / MW 9 / EU 29 / WU 7 / HWB 22）。'
  ],
  calc:{ type:'items', unit:'%', percent:true, note:'按占可得学分百分比定级。',
    thresholds:[{min:40,lvl:'Bronze 铜级'},{min:55,lvl:'Silver 银级'},{min:65,lvl:'Gold 金级'},{min:75,lvl:'Platinum 铂金级'}] }
},
{
  id:'edge', cat:'green', abbr:'EDGE', name:'EDGE',
  region:'世行 IFC · GBCI 审核', tag:'低成本批量',
  tagline:'低成本新兴市场绿建，门槛：能耗、水、建材含能各节省至少 20%，适合地产批量项目。',
  src:{ doc:'EDGE Certification – 认证标准与三项资源门槛', ver:'EDGE v3', org:'IFC（世界银行集团）/ GBCI',
        url:'https://edgebuildings.com/certify/', checked:'', status:'pending',
        note:'三项 20% 门槛为公开通用口径；EDGE v3 的基准与材料含能计算方法待核官方标准文件。' },
  apply:[
    '使用 <b>EDGE 软件</b>免费建模，对比基准建筑测算三项资源节省率；',
    '在 GBCI <b>注册</b>并提交申请；',
    '提交设计阶段文件审核；',
    '施工阶段进行<b>现场核查（Site Audit）</b>；',
    '通过后授证，可进阶 <b>EDGE Advanced</b>（节能 40%）与 <b>Zero Carbon</b>（零碳）。'
  ],
  levels:[
    {name:'EDGE 认证',       range:'三项各 ≥20%', desc:'基础认证'},
    {name:'EDGE Advanced',   range:'能耗 ≥40%',   desc:'高能效进阶'},
    {name:'Zero Carbon 零碳',range:'100% 可再生电力 + 碳抵消', desc:'零碳认证'}
  ],
  indicators:[
    ['能耗（运行能源）',20],['用水',20],['建材含能（Embodied Energy in Materials）',20]
  ],
  scoring:[
    '不设累计打分，而是<b>三项硬门槛</b>：能耗、用水、建材含能相对基准建筑各节省 ≥20%；',
    '基准由 EDGE 软件按当地典型做法自动生成；',
    '运行阶段另有实测核验要求。'
  ],
  calc:{ type:'check', title:'三项资源节省门槛（达标请勾选）',
    items:[
      {k:'e', label:'能耗节省 ≥20%（Advanced：≥40%）', small:'相对当地基准建筑的运行能耗'},
      {k:'w', label:'用水节省 ≥20%', small:'相对基准建筑的用水量'},
      {k:'m', label:'建材含能节省 ≥20%', small:'主要材料全生命期含能'}
    ],
    result(c){
      if(c.e&&c.w&&c.m){
        return {ok:true, txt:'✅ 三项全部达标 —— 达到 <b>EDGE 认证</b>' + (c.e40?'，能耗若 ≥40% 可授 <b>EDGE Advanced</b>。':'。')};
      }
      return {ok:false, txt:'❌ 尚未达标：能耗、用水、建材含能<b>三项须同时 ≥20%</b> 方可获认证。'};
    }
  }
},
{
  id:'greenstar', cat:'green', abbr:'GS', name:'Green Star',
  region:'澳大利亚 · GBCA', tag:'澳新主流',
  tagline:'澳新主流绿建体系。',
  src:{ doc:'Green Star Buildings v1.1 提交指南（Submission Guidelines Rev A）', ver:'Buildings v1.1', org:'GBCA（澳大利亚绿建委员会）',
        url:'https://www.gbca.au/green-star-buildings-v1-1', checked:'2026-10-19', status:'verified',
        note:'已核官方：v1 已于 2026-04-30 停止注册，2026-05-01 起新项目须注册 v1.1；全部 Minimum Expectations 达标后方可计分，4/5/6 星 = 15/35/70 分（满分 100）。' },
  apply:[
    '向澳洲绿建委员会（GBCA）<b>注册</b>并选择评价工具（Performance 运营版 / Buildings 新建版）；',
    '聘请 GBCA 认可的<b>独立评审员</b>；',
    '提交管理、能源、水、材料等类别的证明文件；',
    'GBCA 评审并授星（运营版基于 12 个月实测数据）。'
  ],
  levels:[
    {name:'4 星', range:'≥15 分（且全部 Minimum Expectations 达标）', desc:'最佳实践（Best Practice）'},
    {name:'5 星', range:'≥35 分', desc:'澳洲卓越（Australian Excellence）'},
    {name:'6 星', range:'≥70 分（满分 100）',   desc:'世界领先（World Leadership）'}
  ],
  indicators:[
    ['Responsible 责任建造'],['Healthy 健康'],['Resilient 韧性'],['Positive 正向贡献'],
    ['Places 场所'],['People 人文'],['Nature 自然']
  ],
  scoring:[
    '先满足<b>全部 Minimum Expectations（15 项强制信用）</b>，这些强制项不计分，之后才按信用得分定星；',
    '星级门槛为 <b>15 / 35 / 70 分</b>（满分 100），不是旧版 Design & As Built 的 45/60/75；',
    '5 星及以上须走<b>气候正向路径（Climate Positive Pathway）</b>：全电、可再生供电、低隐含碳等；',
    'Leadership 类别另有额外信用分，可叠加在 100 分核心之外。'
  ],
  calc:{ type:'total', unit:'分', total:100, note:'满分 100 分；须先满足全部 Minimum Expectations，门槛 15/35/70。',
    thresholds:[{min:15,lvl:'4 星 · 最佳实践'},{min:35,lvl:'5 星 · 澳洲卓越'},{min:70,lvl:'6 星 · 世界领先'}] }
},
{
  id:'lbc', cat:'green', abbr:'LBC', name:'Living Building Challenge',
  region:'美国 · ILFI', tag:'极限可持续',
  tagline:'最严苛，追求净零、自给自足、生物友好，属于"极限可持续"。',
  src:{ doc:'Living Building Challenge 4.0 – Petal Handbook', ver:'LBC 4.0', org:'ILFI',
        url:'https://living-future.org/lbc/', checked:'', status:'pending',
        note:'七花瓣结构稳定；各花瓣必要条款（Imperatives）条目数随版本调整，待核 4.0 手册。' },
  apply:[
    '向国际未来生活研究所（ILFI）<b>注册</b>项目并选定花瓣路径；',
    '按花瓣要求设计：红名单材料规避、净零水、净零能源等；',
    '竣工后须<b>连续运行 12 个月</b>的实测数据；',
    'ILFI 派员<b>现场审计</b>（含水/能耗账单与材料溯源核查）后授证。'
  ],
  levels:[
    {name:'Full 全认证', range:'7 个花瓣全部达成', desc:'净零水+净零能源+全红名单材料规避'},
    {name:'Petal 花瓣认证', range:'≥3 个花瓣（须含水/能源/材料之一）', desc:'部分达成的中间路径'},
    {name:'Core 核心认证', range:'核心必要条款', desc:'基础完整性认证'}
  ],
  indicators:[
    ['场所 Place',1],['水 Water',1],['能源 Energy',1],['健康与幸福',1],
    ['材料 Materials',1],['公平 Equity',1],['美 Beauty',1]
  ],
  scoring:[
    '不打累计分，采用<b>花瓣式达标制</b>：每个花瓣内含若干"必要条款（Imperatives）"，须逐条达成；',
    '全认证要求全部 7 花瓣达成并经 12 个月实测；',
    '另有零能源（Zero Energy）、零碳（Zero Carbon）专项认证。'
  ],
  calc:{ type:'check', title:'花瓣达成情况（达成请勾选）',
    items:[
      {k:'place',label:'场所（限制城市蔓延、生态修复）'},
      {k:'water',label:'水（净零水）'},
      {k:'energy',label:'能源（净零能源，一年实测）'},
      {k:'wellbeing',label:'健康与幸福（室内环境质量）'},
      {k:'materials',label:'材料（红名单规避、材料溯源）'},
      {k:'equity',label:'公平（无障碍、社会公平）'},
      {k:'beauty',label:'美（教育展示、美学）'}
    ],
    result(c){
      const n=['place','water','energy','wellbeing','materials','equity','beauty'].filter(k=>c[k]).length;
      if(n===7) return {ok:true, txt:'🏆 7 花瓣全部达成 → 具备 <b>Full 全认证</b>条件（还需 12 个月运行实测 + 现场审计）。'};
      const petalOk=(c.water||c.energy||c.materials)&&n>=3;
      if(petalOk) return {ok:true, txt:`✅ 已勾选 ${n} 个花瓣且含水/能源/材料之一 → 可申请 <b>Petal 花瓣认证</b>。`};
      if(n>0) return {ok:false, txt:`已勾选 ${n} 个花瓣。Petal 认证需 ≥3 个花瓣且必须包含<b>水 / 能源 / 材料</b>之一；Full 需 7 项全部达成。`};
      return {ok:false, txt:'请先勾选达成的花瓣。'};
    }
  }
},
{
  id:'greenglobes', cat:'green', abbr:'GG', name:'Green Globes',
  region:'美国/加拿大 · GBI', tag:'LEED 平价替代',
  tagline:'LEED 的简化替代，文档工作量更低。',
  src:{ doc:'Green Globes for New Construction – 评分问卷', ver:'NC 2021', org:'GBI',
        url:'https://thegbi.org/green-globes-certification/', checked:'', status:'pending',
        note:'35/55/70/85% 四档星级为公开口径；各模块权重按公开资料概化，待核官方问卷。' },
  apply:[
    '在 GBI 官网<b>购买评估</b>并开通在线问卷；',
    '完成自评问卷（约数百题），上传证明文件；',
    '第三方<b>评估师</b>远程评审，必要时现场核查；',
    '出评估报告与星数证书（通常 2–3 个月，费用低于 LEED）。'
  ],
  levels:[
    {name:'一星 Globe', range:'35–54%', desc:'入门'},
    {name:'二星 Globe', range:'55–69%', desc:'常规'},
    {name:'三星 Globe', range:'70–84%', desc:'优秀'},
    {name:'四星 Globe', range:'85–100%', desc:'标杆'}
  ],
  indicators:[
    ['项目管理',10],['场地',10],['能源',35],['水',10],
    ['材料',12],['室内环境',15],['排放',8]
  ],
  scoring:[
    '千分制问卷累加，按<b>得分百分比</b>定星；',
    '能源模块占比最大，内置能耗模拟对标（与 ASHRAE 基准比对）；',
    '权重为概化值。'
  ],
  calc:{ type:'items', unit:'%', percent:true, note:'按总得分百分比定星。',
    thresholds:[{min:35,lvl:'一星'},{min:55,lvl:'二星'},{min:70,lvl:'三星'},{min:85,lvl:'四星'}] }
},
{
  id:'hqe', cat:'green', abbr:'HQE', name:'HQE',
  region:'法国 · Qualitel / CERWAY', tag:'法国高端',
  tagline:'法国高品质环境建筑。',
  src:{ doc:'HQE Bâtiment Durable – Référentiel', ver:'现行版', org:'Qualitel / CERWAY',
        url:'https://www.qualitel.org/', checked:'', status:'pending',
        note:'本页四大维度权重与等级分值线为概化示例，HQE 官方按 14 个目标评分，须核对现行参考手册。' },
  apply:[
    '向 CERWAY（Qualitel 集团）<b>注册</b>项目，选定 HQE 建筑评价方案；',
    '在 14 个"目标"上选择目标等级并准备证明；',
    '<b>设计评估</b>（施工图阶段）+ <b>竣工/运行评估</b>两阶段；',
    '审核通过后授证，附各维度表现徽章。'
  ],
  levels:[
    {name:'Pass 基础',    range:'≥50%（概化）', desc:'达标授证'},
    {name:'Silver 银',    range:'≥60%（概化）', desc:'高性能'},
    {name:'Gold 金',      range:'≥70%（概化）', desc:'高性能+'},
    {name:'Platinum 铂金',range:'≥80%（概化）', desc:'卓越'}
  ],
  indicators:[
    ['能源与气候',25],['环境（水/废弃物/碳）',25],['健康与舒适',25],['管理与维护',25]
  ],
  scoring:[
    '14 个目标分属四大维度，按目标评分并加权汇总；',
    '每个目标同时设<b>最低等级要求</b>，避免偏科；',
    '分值线为概化示例，正式以 CERWAY 评分表为准。'
  ],
  calc:{ type:'items', unit:'%', percent:true, note:'四大维度加权得分率，分值线为概化示例。',
    thresholds:[{min:50,lvl:'Pass 基础'},{min:60,lvl:'Silver 银'},{min:70,lvl:'Gold 金'},{min:80,lvl:'Platinum 铂金'}] }
},
{
  id:'cn3star', cat:'green', abbr:'绿建三星', name:'中国绿色建筑三星',
  region:'中国 · GB/T 50378-2019', tag:'国内最主流',
  tagline:'国内官方绿色建筑评价标识，一星 / 二星 / 三星，国内项目最主流。',
  src:{ doc:'《绿色建筑评价标准》GB/T 50378-2019（2024 年版）', ver:'2019（2024 修订）', org:'住建部 / 中国城科会',
        url:'https://www.mohurd.gov.cn/', checked:'2026-10-19', status:'verified',
        note:'已核原文：Q=(Q0+Q1~Q5+QA)/10，Q0=400，一/二/三星 60/70/85 分，每类评分项 ≥ 满分 30%。' },
  apply:[
    '依据 <b>GB/T 50378-2019</b>，向省级住建主管部门或中国城市科学研究会等评价机构申报；',
    '<b>预评价</b>：施工图审查完成后可申请预评价（出预评价报告，不发标识）；',
    '<b>评价</b>：竣工验收后正式评价，取得星级<b>标识证书</b>；',
    '须满足<b>全部控制项</b>，且每类评分项得分 ≥ 其满分的 30%；',
    '一~三星级项目须<b>全装修</b>交付并满足相应星级技术要求（围护结构提高比例、绿色建材比例等）。'
  ],
  levels:[
    {name:'基本级', range:'满足全部控制项', desc:'不发星级'},
    {name:'一星级', range:'总得分 ≥60 分', desc:'绿色建材应用比例 ≥10% 等技术要求'},
    {name:'二星级', range:'总得分 ≥70 分', desc:'围护结构提高5% 或负荷降低3% 等'},
    {name:'三星级', range:'总得分 ≥85 分', desc:'围护结构提高10% 或负荷降低5% 等'}
  ],
  indicators:[
    ['安全耐久 Q1',100],['健康舒适 Q2',100],['生活便利 Q3',100],
    ['资源节约 Q4',200],['环境宜居 Q5',100],['提高与创新加分 QA',100]
  ],
  scoring:[
    '总得分 <b>Q =（控制项基础分 400 + Q1~Q5 + QA）÷ 10</b>，满分 110 分；',
    '每类评分项得分不得小于其满分值的 <b>30%</b>；',
    '提高与创新加分项满分 100 分（对应总得分 +10），如超低能耗、碳排放计算、BIM 应用等；',
    '资源节约权重最大（200 分），是得分主力。'
  ],
  calc:{ type:'gbt50378', note:'按 GB/T 50378-2019 式 3.2.5 计算：Q=(400+Q1+…+Q5+QA)/10，满分 110。' }
},

/* ================= 二、健康建筑认证 ================= */
{
  id:'fitwel', cat:'health', abbr:'Fitwel', name:'Fitwel',
  region:'美国 · CDC / AMD 发起', tag:'WELL 平价替代',
  tagline:'WELL 最大竞品，同样评估室内空气、采光、运动、心理健康；检测要求比 WELL 轻，成本更低，商业办公常用。',
  src:{ doc:'Fitwel Scorecard / 认证评分说明', ver:'v3', org:'CfAD（CDC 研究合作）',
        url:'https://www.fitwel.org/', checked:'', status:'pending',
        note:'三星期门槛公开资料存在 120 与 125 两种口径（满分 144），待核官方记分卡；本页暂按 125。' },
  apply:[
    '在 Fitwel 官网<b>注册</b>账号与项目（新建 / 既有 / 室内等多版本）；',
    '使用在线<b>记分卡（Scorecard）</b>自评逐项打分；',
    '按记分项上传平面图、照片与政策文件；',
    'Fitwel 团队<b>文件审核</b>（无现场测试），通过后授星；',
    '费用与周期显著低于 WELL，适合批量楼栋组合申报（Portfolio 方案）。'
  ],
  levels:[
    {name:'1 星', range:'90–104 分', desc:'达标'},
    {name:'2 星', range:'105–124 分', desc:'良好'},
    {name:'3 星', range:'≥125 分',   desc:'优秀（满分 144）'}
  ],
  indicators:[
    ['社区健康植入'],['增加体力活动'],['健康饮食'],['主动通勤'],
    ['室内环境与健康'],['心理健康与社会公平'],['应急健康保障']
  ],
  scoring:[
    '约 60+ 记分项累加计分（满分 144），无先决条件，不打分制而是按总分定星；',
    '每项措施不分权重高低，"多做多得"，改造型项目友好；',
    '得分线：90 / 105 / 120 分对应 1–3 星。'
  ],
  calc:{ type:'total', unit:'分', total:144, note:'满分 144 分；三星期门槛暂按 125，待官方记分卡确认。',
    thresholds:[{min:90,lvl:'1 星'},{min:105,lvl:'2 星'},{min:125,lvl:'3 星'}] }
},
{
  id:'well', cat:'health', abbr:'WELL', name:'WELL（健康建筑标准）',
  region:'美国 · IWBI', tag:'健康建筑标杆',
  tagline:'健康建筑标杆体系，室内人居健康的国际金标准。',
  src:{ doc:'WELL v2 Certification – 评分与等级规则', ver:'WELL v2', org:'IWBI / GBCI',
        url:'https://well.support/727d504c-f24c-4b3c-bdd1-1bccf7725c41', checked:'2026-10-19', status:'verified',
        note:'已核原文：铜 40 / 银 50 / 金 60 / 铂金 80；满分 110（100 特性 + 10 创新）；银/金/铂金分别要求每个概念至少 1/2/3 分，铜级无单概念最低要求。' },
  apply:[
    '在 IWBI <b>注册</b>项目并选定版本（WELL v2）与空间类型；',
    '建议聘请 <b>WELL AP</b> 统筹；',
    '按概念逐条准备文档与<b>现场性能验证（Performance Verification）</b>——空气/水/声光需第三方实测；',
    'GBCI 审核通过后授证；证书有效期 <b>3 年</b>，到期复评；',
    '可选先决条件全部达成后方可计分。'
  ],
  levels:[
    {name:'Bronze 铜级',  range:'40–49 分', desc:'基础'},
    {name:'Silver 银级',  range:'50–59 分', desc:'常规'},
    {name:'Gold 金级',    range:'60–79 分', desc:'主流目标'},
    {name:'Platinum 铂金级',range:'≥80 分', desc:'标杆'}
  ],
  indicators:[
    ['空气 Air'],['水 Water'],['营养 Nourishment'],['光 Light'],['运动 Movement'],
    ['热舒适 Thermal Comfort'],['声环境 Sound'],['材料 Materials'],['精神 Mind'],['社区 Community']
  ],
  scoring:[
    '满分 110 分（100 特性分 + 10 创新分）；每个特性的分值不同，按总分定级；',
    '<b>先决条件（Preconditions）</b>必须全部达成，否则不得授级；',
    '各等级另有<b>单概念最低分</b>：银级每概念 ≥1 分、金级 ≥2 分、铂金级 ≥3 分（铜级无单概念要求，且仅对 Core 壳核项目开放）；',
    '与 Fitwel 相比：检测要求重（需第三方现场实测）、成本高，但公认度最高。'
  ],
  calc:{ type:'total', unit:'分', total:110, note:'满分 110 分；须先达成全部先决条件。',
    thresholds:[{min:40,lvl:'Bronze 铜级'},{min:50,lvl:'Silver 银级'},{min:60,lvl:'Gold 金级'},{min:80,lvl:'Platinum 铂金级'}] }
},
{
  id:'hsr', cat:'health', abbr:'WELL HSR', name:'WELL HSR',
  region:'美国 · IWBI', tag:'健康安全评价',
  tagline:'WELL 健康安全评级，侧重防疫、卫生。',
  src:{ doc:'WELL Health-Safety Rating – 评分规则', ver:'v2', org:'IWBI',
        url:'https://www.wellcertified.com/health-safety', checked:'2026-10-19', status:'verified',
        note:'已核：24 项特性中须达成 15 项（本页按 5 大主题概化勾选）；年度维护。' },
  apply:[
    '面向已注册/已认证 WELL 项目或新申请项目开放；',
    '编制<b>健康安全运营手册</b>（应急计划、清洁规程、空气与水管理、员工沟通等）；',
    '提交 GBCI <b>文件审核</b>，必要时补充证明；',
    '通过后授予 <b>HSR 印章</b>，此后每年提交年度声明维持。'
  ],
  levels:[
    {name:'达标授印', range:'必备条款全部通过', desc:'授予 WELL Health-Safety 印章'},
    {name:'不授印', range:'存在必备条款未达成', desc:'补充后重新提交'}
  ],
  indicators:[
    ['应急准备计划'],['卫生与清洁规程'],['应急空气质量管理'],['水质管理'],
    ['病患/疑似应对'],['员工健康沟通与服务']
  ],
  scoring:[
    '采用<b>条款达标制</b>：官方为 <b>24 项特性中达成 15 项</b>即可授印，本页按 5 大主题归并展示；',
    '重点在"运营制度"而非硬件改造，可低成本快速落地；',
    '强调年度维持，突出物业持续运营承诺。'
  ],
  calc:{ type:'check', title:'必备条款达成情况（达成请勾选）',
    items:[
      {k:'a',label:'应急准备与响应计划已建立'},
      {k:'b',label:'清洁与卫生规程（含高频接触面消毒）已落地'},
      {k:'c',label:'应急空气质量管理（新风加大/过滤升级方案）'},
      {k:'d',label:'水质管理与 legionella（军团菌）防控'},
      {k:'e',label:'员工健康沟通、培训与服务支持'}
    ],
    result(c){
      const need=['a','b','c','d','e'];
      if(need.every(k=>c[k])) return {ok:true, txt:'✅ 必备条款全部达成 → 具备授予 <b>WELL HSR 健康安全印章</b>条件（提交 GBCI 审核后生效，逐年维持）。'};
      const miss=need.filter(k=>!c[k]).length;
      return {ok:false, txt:`❌ 还有 ${miss} 项必备条款未达成，全部通过方可授印。`};
    }
  }
},
{
  id:'cnhealth', cat:'health', abbr:'健康标识', name:'中国健康建筑标识',
  region:'中国 · T/ASC 02 健康建筑评价标准', tag:'国内项目常与绿建三星配套',
  tagline:'国内健康建筑标识，国内项目常与绿建三星配套使用。',
  src:{ doc:'《健康建筑评价标准》T/ASC 02（2021 版）', ver:'T/ASC 02-2021', org:'中国建筑学会',
        url:'http://www.chinaasc.org.cn/', checked:'2026-10-19', status:'verified',
        note:'已核原文：六类指标加权，基本级/一星/二星/三星 = 40/50/60/80 分，每类 ≥30 分；运行评价权重 空气.25/水.20/舒适.25/健身.10/人文.10/服务.10。' },
  apply:[
    '依据中国建筑学会 <b>T/ASC 02《健康建筑评价标准》</b>，向评价管理机构申报；',
    '<b>设计标识</b>：施工图审查通过后可评；<b>运行标识</b>：运行一年后评价（须含"服务"章节）；',
    '须满足<b>全部控制项</b>，每类评分项得分 ≥30 分；',
    '六类指标（空气、水、舒适、健身、人文、服务）加权汇总总分；',
    '专家评审、公示后授标。'
  ],
  levels:[
    {name:'基本级（铜）', range:'≥40 分', desc:'对应铜级'},
    {name:'一星级（银）', range:'≥50 分', desc:'对应银级'},
    {name:'二星级（金）', range:'≥60 分', desc:'对应金级'},
    {name:'三星级（铂金）', range:'≥80 分', desc:'对应铂金级'}
  ],
  indicators:[
    ['空气',0.25],['水',0.20],['舒适',0.25],['健身',0.15],['人文',0.15],['服务（仅运行评价）',0.10]
  ],
  scoring:[
    '总得分 <b>ΣQ = w₁·Q₁ + … + w₆·Q₆ + Q₇（加分）</b>，六类指标各按百分制评分；',
    '设计评价权重（2021 版）：空气 .25 / 水 .20 / 舒适 .25 / 健身 .15 / 人文 .15，服务不参评；',
    '运行评价权重：空气 .25 / 水 .20 / 舒适 .25 / 健身 .10 / 人文 .10 / 服务 .10；',
    '每类评分项得分不得小于 <b>30 分</b>。'
  ],
  calc:{ type:'health', note:'六类各填 0–100 分，按权重加权 + 加分项（≤10），每类须 ≥30 分。' }
},

/* ================= 三、专项建筑认证 ================= */
{
  id:'passive', cat:'spec', abbr:'PHI', name:'Passive House（被动房）',
  region:'德国 · 被动房研究所 PHI', tag:'极致超低能耗',
  tagline:'极致超低能耗建筑。',
  src:{ doc:'Passive House 建筑认证准则（Building Criteria, Version 10c）', ver:'10c（2023）', org:'Passive House Institute（PHI）',
        url:'https://passiv.de/en/02_informations/02_passive-house-requirements/02_passive-house-requirements.htm',
        checked:'2026-10-19', status:'verified',
        note:'已核官方准则表 1：采暖需求 ≤15 kWh/(㎡·a) 或采暖负荷 ≤10 W/㎡（替代准则，二者取一）；气密 n50 ≤0.6/h；PER 需求 Classic ≤60、Plus ≤45、Premium ≤30；可再生发电 Plus ≥60、Premium ≥120，允许 ±15 偏差并以额外发电补偿。' },
  apply:[
    '聘请 <b>PHI 认证的被动房设计师/咨询机构</b>，使用 <b>PHPP</b> 能耗软件建模；',
    '设计阶段按能耗指标优化围护结构、气密性与新风热回收；',
    '施工中做<b>鼓风门气密性测试（n50）</b>与节点验收；',
    '提交 PHPP 计算书 + 现场测试报告，由 PHI 或其授权机构审核授证。'
  ],
  levels:[
    {name:'Classic 经典', range:'PER ≤60，无发电要求', desc:'标准被动房'},
    {name:'Plus',        range:'PER ≤45 + 可再生能源产出 ≥60 kWh/(㎡·a)', desc:'产能进阶'},
    {name:'Premium',     range:'PER ≤30 + 可再生能源产出 ≥120 kWh/(㎡·a)', desc:'正产能建筑'}
  ],
  indicators:[
    ['采暖需求 ≤15 kWh/(㎡·a)（或采暖负荷 ≤10 W/㎡，二选一）'],
    ['气密性 n50 ≤0.6 /h'],
    ['PER 需求：Classic ≤60 / Plus ≤45 / Premium ≤30 kWh/(㎡·a)'],
    ['可再生能源发电：Plus ≥60 / Premium ≥120 kWh/(㎡·a)']
  ],
  scoring:[
    '不打分，采用<b>硬指标达标制</b>：采暖（需求或负荷满足其一）、气密性、PER 三项须全部满足；',
    'Classic / Plus / Premium 按 <b>PER 需求上限 + 可再生能源发电量</b>共同划分：(60, —)、(45, 60)、(30, 120)；',
    'PER 允许 ±15 kWh/(㎡·a) 偏差，但须以额外发电量补偿；制冷需求、湿度等另有限值（视气候区）。'
  ],
  calc:{ type:'check', title:'核心能耗指标（达标请勾选）',
    items:[
      {k:'h',label:'采暖需求 ≤15 kWh/(㎡·a) 或采暖负荷 ≤10 W/㎡',small:'官方两项替代准则，满足其一即可'},
      {k:'a',label:'气密性 n50 ≤0.6 /h',small:'鼓风门实测结果'},
      {k:'p60',label:'PER 需求 ≤60 kWh/(㎡·a)',small:'Classic 门槛'},
      {k:'p45',label:'PER 需求 ≤45 kWh/(㎡·a)',small:'Plus 门槛'},
      {k:'p30',label:'PER 需求 ≤30 kWh/(㎡·a)',small:'Premium 门槛'},
      {k:'r60',label:'可再生能源设备产出 ≥60 kWh/(㎡·a)',small:'Plus 门槛'},
      {k:'r120',label:'可再生能源设备产出 ≥120 kWh/(㎡·a)',small:'Premium 门槛'}
    ],
    result(c){
      if(!(c.h&&c.a&&c.p60))
        return {ok:false, txt:'❌ 核心指标未全达标：采暖（需求或负荷）、气密性 n50、PER ≤60 须同时满足，方可获得被动房认证。'};
      if(c.p30&&c.r120) return {ok:true, txt:'🏆 PER ≤30 + 可再生能源产出 ≥120 → 可认证 <b>Premium</b>（正产能建筑）。'};
      if(c.p45&&c.r60)  return {ok:true, txt:'✅ PER ≤45 + 可再生能源产出 ≥60 → 可认证 <b>Plus</b>。'};
      return {ok:true, txt:'✅ 核心条件达标（PER ≤60、无发电要求）→ 可认证 <b>Classic 经典被动房</b>。'};
    }
  }
},
{
  id:'nabers', cat:'spec', abbr:'NABERS', name:'NABERS',
  region:'澳大利亚 · NSW 政府管理', tag:'实测运行性能',
  tagline:'建筑实际运行能耗星级（实测性能）。',
  src:{ doc:'NABERS Energy and Water for Offices — Rules v5.1', ver:'Rules v5.1（现行）', org:'NABERS（澳大利亚政府）',
        url:'https://www.nabers.gov.au/sites/default/files/2023-06/nabers_energy_and_water_for_offices_v5.1.pdf',
        checked:'2026-10-19', status:'verified',
        note:'已核官方：1–6 星、半星递增（0 星表示远低于平均、不列入正式刻度）；6 星=最佳市场实践，约为 5 星排放的一半；按 12 个月实测数据与同类基准比对，评级有效期 12 个月。' },
  apply:[
    '面向<b>已运营 ≥12 个月</b>的建筑（办公、酒店、数据中心等）；',
    '聘请 NABERS <b>认证评估师</b>采集 12 个月实测能耗/水/废弃物数据；',
    '与同气候区同类型建筑<b>基准数据库</b>比对排名；',
    '授星并载入公开注册名录，有效期约 1 年，可持续复评。'
  ],
  levels:[
    {name:'6 星', desc:'市场领先（最佳市场实践，约为 5 星排放的一半）'},
    {name:'5 星', desc:'优秀'},
    {name:'4 星', desc:'良好（同类平均水平之上）'},
    {name:'3 星', desc:'同类平均'},
    {name:'2 星及以下', desc:'落后于同类均值'}
  ],
  indicators:[
    ['能耗（Energy）'],['水（Water）'],['废弃物（Waste）'],['室内环境（IEQ）']
  ],
  scoring:[
    '以<b>实测数据</b>而非设计值评级：<b>1–6 星、半星递增</b>；0 星表示远低于平均、不列入正式刻度；',
    '排名式评级：得分取决于与同类建筑年度数据的相对位置（基准按年度数据集更新）；',
    '可按"整楼""基座建筑"或"租户部分"分别评级，评级有效期 12 个月。'
  ],
  calc:{ type:'nabers' }
},
{
  id:'energystar', cat:'spec', abbr:'ES', name:'ENERGY STAR',
  region:'美国 · EPA 环保署', tag:'能效标识',
  tagline:'美国建筑能效标识。',
  src:{ doc:'ENERGY STAR Certification for Buildings（EPA 官方评分与认证规则）', ver:'现行', org:'US EPA',
        url:'https://www.energystar.gov/buildings/building-recognition/building-certification', checked:'2026-10-19', status:'verified',
        note:'已核官方：Portfolio Manager 1–100 分，≥75 分（优于同类至少 75%）方可申请；须由 PE 或注册建筑师（RA）核证，逐年复证。' },
  apply:[
    '在 EPA <b>Portfolio Manager</b> 平台录入建筑 12 个月实测能耗数据；',
    '系统按同类型建筑分布自动给出 <b>1–100 能效得分</b>；',
    '得分 ≥75 可申请认证，并由<b>注册工程师（PE）或注册建筑师（RA）</b>核证数据；',
    '审核通过授证，<b>每年更新</b>维持。'
  ],
  levels:[
    {name:'认证通过', range:'得分 ≥75', desc:'能效居同类建筑前 25%'},
    {name:'未达标', range:'得分 <75', desc:'暂不具备认证资格'}
  ],
  indicators:[
    ['源能耗强度（EUI）'],['建筑类型与用途'],['气候分区与度日数'],['运行时间与人员密度']
  ],
  scoring:[
    '1–100 分为<b>相对排名分</b>：75 分表示优于同类 75% 的建筑；',
    '数据须完整 12 个月，缺月需补录；',
    '每年复证，实测数据不达标即失去认证。'
  ],
  calc:{ type:'total', unit:'分', total:100, note:'≥75 分可认证（同类前 25%）。',
    thresholds:[{min:75,lvl:'ENERGY STAR 认证'}] }
},
{
  id:'sites', cat:'spec', abbr:'SITES', name:'SITES',
  region:'美国 · GBCI', tag:'可持续场地（和 LEED 配套）',
  tagline:'可持续场地景观认证（和 LEED 配套）。',
  src:{ doc:'SITES v2 Rating System（200 分制评分体系）', ver:'SITES v2', org:'GBCI / USGBC / ASLA',
        url:'https://sustainablesites.org/certification-guide', checked:'2026-10-19', status:'verified',
        note:'已核官方：200 分制，四档 70 / 85 / 100 / 135 分；18 项先决条件不计分；另有最多 9 分"创新或优良表现"加分（此前误作 200+10 分、85/100 写成 90/110）。' },
  apply:[
    '在 GBCI（与 LEED 同一审核机构）<b>注册</b>项目；',
    '聘请 <b>SITES AP</b>（可持续场地专业人员）；',
    '完成先决条件并按评分项收集设计/施工文档；',
    '分阶段（设计 / 施工）提交审核，通过后授证。'
  ],
  levels:[
    {name:'Certified 认证', range:'70–84 分', desc:'入门'},
    {name:'Silver 银级',    range:'85–99 分', desc:'常规'},
    {name:'Gold 金级',      range:'100–134 分', desc:'主流目标'},
    {name:'Platinum 铂金级', range:'≥135 分', desc:'标杆'}
  ],
  indicators:[
    ['场地环境（Site Context）'],['设计前评估与规划'],['场地设计 — 水'],['场地设计 — 土壤与植被'],
    ['场地设计 — 材料'],['场地设计 — 人体健康'],['施工'],['运营与维护'],['教育与绩效监测'],['创新或优良表现（加分 9 分）']
  ],
  scoring:[
    '满分 <b>200 分</b>，18 项<b>先决条件（Prerequisites）</b>不计分但必须全部满足；',
    '四档分数线：Certified 70 / Silver 85 / Gold 100 / Platinum 135；',
    '"创新或优良表现"另设最多 <b>9 分</b>加分，可计入总分冲档；',
    '与 LEED 得分点可互相支持，常见"LEED + SITES"组合申报。'
  ],
  calc:{ type:'total', unit:'分', total:200, note:'满分 200 分（另有最多 9 分创新加分）；先决条件须全部满足。',
    thresholds:[{min:70,lvl:'Certified 认证'},{min:85,lvl:'Silver 银级'},{min:100,lvl:'Gold 金级'},{min:135,lvl:'Platinum 铂金级'}] }
}
];

/* ============================================================
   渲染
============================================================ */
const $=s=>document.querySelector(s);
const esc=s=>String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');

function levelPill(i,total){
  const cls=i===total-1?'high':(i===0&&total>2?'low':'mid');
  return `<span class="pill" style="background:${cls==='high'?'var(--green-bg)':cls==='low'?'#eef2f7':'#faf3e0'};color:${cls==='high'?'var(--green)':cls==='low'?'var(--muted)':'#8a6d1f'}"></span>`;
}

function buildSidebar(){
  let h='<div class="grp">自动核对</div><a href="#autocheck" data-anchor>三层核对面板</a><a href="#compare" data-anchor>一句话区分</a><a href="#sources" data-anchor>数据核对记录</a>';  CATS.forEach(c=>{
    h+=`<div class="grp">${c.name}</div>`;
    SYSTEMS.filter(s=>s.cat===c.id).forEach(s=>{
      h+=`<a href="#cert-${s.id}" data-anchor>${s.abbr} · ${s.name.split('（')[0]}</a>`;
    });
  });
  $('#sidebar').innerHTML=h;
}

function catOf(id){return CATS.find(c=>c.id===id);}

/* 依据与核对状态条（状态由三层自动核对结果实时决定） */
function srcLine(s){
  const st=autoState(s.id);
  return `<div class="src-line">📚 依据：<b>${s.src.doc}</b> · ${s.src.ver} · ${s.src.org}
    <a href="${s.src.url}" target="_blank" rel="noopener">官方原文 ↗</a>
    <span class="st ${st.cls}" title="${esc(st.tip||'')}">${st.text}</span></div>`;
}

/* 数据核对记录表 */
function sourcesHTML(){
  const okN=SYSTEMS.filter(s=>s.src.status==='verified').length;
  const rows=SYSTEMS.map(s=>{
    const ok=s.src.status==='verified';
    return `<tr>
      <td>${s.abbr}</td>
      <td>${s.src.doc}</td>
      <td>${s.src.ver}</td>
      <td>${s.src.checked||'—'}</td>
      <td>${ok?'<span class="st ok">已核对</span>':'<span class="st warn">待复核</span>'}</td>
      <td><a href="${s.src.url}" target="_blank" rel="noopener">原文</a></td>
    </tr>`;
  }).join('');
  return `<section class="compare" id="sources">
    <details class="fold">
      <summary class="fold-sum">
        <span class="fold-t">📚 数据核对记录</span>
        <span class="fold-s">${SYSTEMS.length} 个体系 · 已核对官方原文 ${okN} · 待复核 ${SYSTEMS.length-okN} · 最近复核 ${FACTS?esc(FACTS.baseline_updated):'2026-10-19'}</span>
        <span class="fold-x">展开</span>
      </summary>
      <div class="fold-body">
        <p class="src-intro">共 <b>${SYSTEMS.length}</b> 个体系，已核对官方原文 <b>${okN}</b> 个，待复核 <b>${SYSTEMS.length-okN}</b> 个。
          最近人工复核：<b>${FACTS?esc(FACTS.baseline_updated):'2026-10-19'}</b>；
          最近官方源巡检：<b>${AUDIT?esc((AUDIT.generated_at||'').slice(0,10)):'—'}</b>；自动巡检周期：<b>每月 1 日</b>（GitHub Actions）。</p>
        <table class="tbl">
          <tr><th>体系</th><th>依据文件</th><th>版本</th><th>最近核对</th><th>状态</th><th>来源</th></tr>
          ${rows}
        </table>
        <div class="note">复核口径：以认证机构官网发布的现行手册 / 标准原文为准，逐项比对"等级分数线、指标权重、满分与硬性门槛"。
          若官方发布新版本，先在本表登记版本变更，再更新卡片数据与计算器。</div>
      </div>
    </details>
  </section>`;
}

function renderMain(filter=''){
  const kw=filter.trim().toLowerCase();
  let h='';
  CATS.forEach(cat=>{
    const list=SYSTEMS.filter(s=>s.cat===cat.id && (!kw || (s.name+s.abbr+s.region+s.tagline).toLowerCase().includes(kw)));
    if(!list.length) return;
    h+=`<section class="cat-block" id="cat-${cat.id}">
      <div class="cat-head"><span class="dot" style="background:${cat.color}"></span>
        <h2>${cat.name}</h2><span class="cnt">${list.length} 个体系</span></div>
      <p class="cat-intro">${cat.intro}</p>`;
    list.forEach(s=>{ h+=certHTML(s); });
    h+='</section>';
  });
  if(!h) h='<div class="empty">没有匹配的认证体系，换个关键词试试。</div>';
  $('#main').innerHTML=autocheckHTML()+cmpHTML()+h+(kw?'':sourcesHTML());
  bindEvents();
  refreshObserve();
}

/* 重绘后重新挂滚动观察（.ac 为自动核对面板） */
function refreshObserve(){
  if(!window.io) return;
  document.querySelectorAll('.cert,.compare,.ac').forEach(el=>window.io.observe(el));
}

function cmpHTML(){
  return `<section class="compare" id="compare">
    <h2>⏱ 一句话区分</h2>
    <table class="tbl">
      <tr><th>体系</th><th>一句话</th></tr>
      <tr><td>LEED</td><td>建筑对地球友好（环境可持续）——全球最通用</td></tr>
      <tr><td>WELL</td><td>建筑对人健康友好（室内人居）</td></tr>
      <tr><td>BREEAM</td><td>老牌全生命期绿建（英国）</td></tr>
      <tr><td>DGNB</td><td>欧洲综合可持续（经济+生态+社会）</td></tr>
      <tr><td>Fitwel</td><td>WELL 平价替代，检测轻、成本低</td></tr>
      <tr><td>绿建三星</td><td>国内官方绿色标识，最主流</td></tr>
      <tr><td>被动房 PHI</td><td>极致超低能耗（硬指标达标制）</td></tr>
      <tr><td>NABERS</td><td>实测运行能耗星级（真跑出来的性能）</td></tr>
      <tr><td>SITES</td><td>可持续场地景观（和 LEED 配套）</td></tr>
      <tr><td>LBC</td><td>极限可持续：净零水 + 净零能源 + 红名单材料</td></tr>
      <tr><td>EDGE</td><td>低成本三门槛：能耗/水/建材各省 20%</td></tr>
    </table>
  </section>`;
}

function certHTML(s){
  const c=catOf(s.cat);
  const open=window.__openSet&&window.__openSet.has(s.id)?' open':'';
  return `<article class="cert${open}" id="cert-${s.id}">
    <div class="cert-head" data-toggle="${s.id}">
      <div class="logo" style="background:${c.color}">${s.abbr}</div>
      <div class="ttl">
        <h3>${s.name}</h3>
        <div class="meta">${s.region} · ${s.tag}</div>
      </div>
      <span class="arrow">▶</span>
    </div>
    <div class="cert-body">
      <p class="tagline">${s.tagline}</p>
      ${srcLine(s)}
      <div class="tabs">
        <button data-tab="apply" class="active">📋 参评办法</button>
        <button data-tab="levels">🏅 等级与评价指标</button>
        <button data-tab="scoring">📐 评分标准</button>
        <button data-tab="calc">🧮 得分计算器</button>
      </div>
      <div class="tabpane active" data-pane="apply">
        <h4 class="blk">申报流程</h4>
        <ul class="steps">${s.apply.map(t=>`<li>${t}</li>`).join('')}</ul>
        <p class="badge-line"><span>认证机构：${s.region}</span></p>
      </div>
      <div class="tabpane" data-pane="levels">
        <h4 class="blk">等级划分</h4>
        <table class="tbl"><tr><th>等级</th><th>分数线 / 条件</th><th>定位</th></tr>
        ${s.levels.map((l,i)=>`<tr><td>${l.name}</td><td>${l.range||'—'}</td><td>${l.desc||''}</td></tr>`).join('')}</table>
        <h4 class="blk">评价指标构成</h4>
        <table class="tbl"><tr><th>指标类别</th><th>权重 / 满分</th></tr>
        ${s.indicators.map(it=>`<tr><td>${it[0]}</td><td>${it[1]!==undefined?it[1]:'—'}</td></tr>`).join('')}</table>
      </div>
      <div class="tabpane" data-pane="scoring">
        <h4 class="blk">评分规则</h4>
        <ul class="steps">${s.scoring.map(t=>`<li>${t}</li>`).join('')}</ul>
      </div>
      <div class="tabpane" data-pane="calc">
        ${calcHTML(s)}
      </div>
    </div>
  </article>`;
}

/* ---------- 计算器 ---------- */
function calcHTML(s){
  const k=s.calc;
  let inner='';
  if(k.type==='items'){
    const denom = k.percent ? 100 : k.total;
    inner = k.percent
      ? s.indicators.map((it,i)=>calcRow(i,it[0],100)).join('')
      : s.indicators.map((it,i)=>calcRow(i,it[0],it[1])).join('');
    if(!k.percent && s.indicators.reduce((a,b)=>a+b[1],0)!==k.total){
      inner+=`<div class="calc-item"><label>创新 / 加分</label><input type="number" min="0" max="${k.total - s.indicators.reduce((a,b)=>a+b[1],0)>0?k.total - s.indicators.reduce((a,b)=>a+b[1],0):0}" value="0" data-ci="${s.indicators.length}"><span class="max">上限视体系而定</span></div>`;
    }
  } else if(k.type==='total'){
    inner=`<div class="calc-item"><label>${k.label||('总分（'+k.unit+'）')}</label><input type="number" min="0" max="${k.total}" value="0" data-ci="0"><span class="max">上限 ${k.total}</span></div>`;
  } else if(k.type==='check'){
    inner=k.items.map((it,i)=>`<label class="chk-item"><input type="checkbox" data-ck="${it.k}"><span>${it.label}${it.small?`<small>${it.small}</small>`:''}</span></label>`).join('');
  } else if(k.type==='nabers'){
    inner=`<div class="slider-wrap"><input type="range" min="0" max="6" step="0.5" value="3" data-slider="${s.id}"><span class="sv" id="nabers-v">3.0 ★</span></div>`;
  } else if(k.type==='gbt50378'){
    inner=`
      <label class="chk-item"><input type="checkbox" id="gb-ctl" checked><span>全部<b>控制项</b>达标（基础分 400 分）<small>未达标则只能评为基本级（不发星）</small></label>
      ${[['安全耐久 Q1',100],['健康舒适 Q2',100],['生活便利 Q3',100],['资源节约 Q4',200],['环境宜居 Q5',100]]
        .map((it,i)=>calcRow(i,it[0],it[1],'gb')).join('')}
      ${calcRow(5,'提高与创新加分 QA',100,'gb')}`;
  } else if(k.type==='health'){
    inner=`
      <div class="calc-item"><label>评价阶段</label>
        <select id="hh-stage" style="padding:6px 10px;border:1px solid #ccd6e0;border-radius:6px">
          <option value="op">运行评价（含服务）</option><option value="de">设计评价（不含服务）</option>
        </select></div>
      ${[['空气',100],['水',100],['舒适',100],['健身',100],['人文',100],['服务',100]]
        .map((it,i)=>calcRow(i,it[0],it[1],'hh')).join('')}
      ${calcRow(6,'提高与创新加分 Q7',10,'hh')}`;
  }
  return `<div class="calc" data-calc="${s.id}">
    <div class="calc-title">🧮 ${k.type==='check'?k.title:'得分计算器'}</div>
    ${inner}
    ${k.type==='check'?`<div class="calc-result fail" data-out="${s.id}">勾选后自动判断认证结果</div>`
                      :`<div class="calc-total" data-out="${s.id}"><span class="score">—</span></div>`}
    <div class="note">ℹ️ ${k.note||''}</div>
  </div>`;
}
function calcRow(i,name,max,prefix=''){
  return `<div class="calc-item"><label>${name}</label><input type="number" min="0" max="${max}" value="0" data-${prefix||'ci'}="${i}"><span class="max">满分 ${max}</span></div>`;
}

/* ---------- 计算逻辑 ---------- */
function levelOf(v,ths){
  let lv={min:-1,lvl:'未达标'},idx=-1;
  ths.forEach((t,i)=>{ if(v>=t.min){lv=t;idx=i;} });
  return {lv,idx};
}
function renderOut(id,html,cls){
  const out=document.querySelector(`[data-out="${id}"]`);
  if(!out)return;
  out.innerHTML=html;
  if(cls!==undefined) out.className=cls;
}
function compute(s){
  const k=s.calc, out=document.querySelector(`[data-out="${s.id}"]`);
  if(!out)return;
  if(k.type==='items'){
    let sum=0, inputs=[...document.querySelectorAll(`[data-calc="${s.id}"] [data-ci]`)];
    inputs.forEach(inp=>{ sum+=Math.max(0,+inp.value||0); });
    const pct = k.percent ? sum : sum/k.total*100;
    const val = k.percent ? pct : sum;
    const {lv,idx}=levelOf(pct,k.thresholds);
    const idxOk=idx>=0;
    renderOut(s.id,`<span class="score">${k.percent?pct.toFixed(1)+'%':sum+' 分'}</span><span class="lvl ${idxOk?(idx===k.thresholds.length-1?'high':'mid'):'low'}">${idxOk?lv.lvl:'未达标'}</span>`);
  } else if(k.type==='total'){
    const v=Math.max(0,Math.min(k.total,+document.querySelector(`[data-calc="${s.id}"] [data-ci]`).value||0));
    const {lv,idx}=levelOf(v,k.thresholds);
    renderOut(s.id,`<span class="score">${v} ${k.unit}</span><span class="lvl ${idx>=0?(idx===k.thresholds.length-1?'high':'mid'):'low'}">${idx>=0?lv.lvl:'未达标'}</span>`);
  } else if(k.type==='check'){
    const c={};
    document.querySelectorAll(`[data-calc="${s.id}"] [data-ck]`).forEach(ch=>c[ch.dataset.ck]=ch.checked);
    const r=k.result(c);
    renderOut(s.id,r.txt, r.ok?'calc-result':'calc-result fail');
  } else if(k.type==='gbt50378'){
    const ctl=document.querySelector('#gb-ctl').checked;
    const q=[...Array(6)].map((_,i)=>Math.max(0,+document.querySelector(`[data-gb="${i}"]`).value||0));
    const caps=[100,100,100,200,100,100];
    q.forEach((v,i)=>{ if(v>caps[i]){document.querySelector(`[data-gb="${i}"]`).value=caps[i];} });
    const Q=(ctl?400:0)+q.reduce((a,b)=>a+b,0);
    const total=Math.round((Q)/10*10)/10;
    const mins=[30,30,30,60,30]; // 每类评分项满分30%：100/100/100/200/100
    const under=q.slice(0,5).some((v,i)=>v<mins[i]);
    let lvl='基本级（控制项达标）';
    if(ctl){
      if(!under){
        if(total>=85) lvl='🏆 三星级';
        else if(total>=70) lvl='🥈 二星级';
        else if(total>=60) lvl='🥉 一星级';
        else lvl='基本级';
      } else lvl='暂不达星：每类评分项得分须 ≥ 其满分的 30%';
    } else lvl='控制项未全部达标 → 只能评为基本级';
    renderOut(s.id,`<span class="score">总得分 ${total} / 110</span><span class="lvl ${total>=85?'high':total>=60?'mid':'low'}">${lvl}</span>`);
  } else if(k.type==='health'){
    const stage=document.querySelector('#hh-stage').value;
    const W_DE=[.25,.20,.25,.15,.15,0], W_OP=[.25,.20,.25,.10,.10,.10];
    const W=stage==='de'?W_DE:W_OP;
    const vals=[...Array(7)].map((_,i)=>Math.max(0,+document.querySelector(`[data-hh="${i}"]`).value||0));
    const caps=[100,100,100,100,100,100,10];
    vals.forEach((v,i)=>{ if(v>caps[i])document.querySelector(`[data-hh="${i}"]`).value=caps[i]; });
    const used=[0,1,2,3,4,...(stage==='de'?[]:[5])];
    let sum=0, low=[];
    used.forEach(i=>{ sum+=W[i]*vals[i]; if(vals[i]<30)low.push(['空气','水','舒适','健身','人文','服务'][i]); });
    sum+=vals[6];
    sum=Math.round(sum*10)/10;
    let lvl;
    if(low.length) lvl=`暂不达星：${low.join('、')} 评分项 <30 分`;
    else if(sum>=80) lvl='🏆 三星级（铂金级）';
    else if(sum>=60) lvl='🥇 二星级（金级）';
    else if(sum>=50) lvl='🥈 一星级（银级）';
    else if(sum>=40&&stage==='op') lvl='基本级（铜级）';
    else lvl='未达标';
    renderOut(s.id,`<span class="score">加权总分 ${sum} 分</span><span class="lvl ${sum>=80?'high':sum>=50?'mid':'low'}">${lvl}</span>`);
  }
}

/* ---------- 事件绑定 ---------- */
function bindEvents(){
  document.querySelectorAll('.cert-head[data-toggle]').forEach(h=>{
    h.onclick=()=>{
      const id=h.dataset.toggle, card=h.closest('.cert');
      card.classList.toggle('open');
      window.__openSet=window.__openSet||new Set();
      card.classList.contains('open')?window.__openSet.add(id):window.__openSet.delete(id);
    };
  });
  document.querySelectorAll('.tabs').forEach(tabs=>{
    tabs.querySelectorAll('button').forEach(btn=>{
      btn.onclick=()=>{
        tabs.querySelectorAll('button').forEach(b=>b.classList.remove('active'));
        btn.classList.add('active');
        const body=tabs.closest('.cert-body');
        body.querySelectorAll('.tabpane').forEach(p=>p.classList.remove('active'));
        body.querySelector(`.tabpane[data-pane="${btn.dataset.tab}"]`).classList.add('active');
      };
    });
  });
  document.querySelectorAll('.calc').forEach(c=>{
    c.addEventListener('input',()=>{ compute(SYSTEMS.find(s=>s.id===c.dataset.calc)); });
    c.addEventListener('change',()=>{ compute(SYSTEMS.find(s=>s.id===c.dataset.calc)); });
  });
  const slider=document.querySelector('[data-slider="nabers"]');
  if(slider){
    const upd=()=>{
      const v=+slider.value;
      document.getElementById('nabers-v').textContent=v.toFixed(1)+' ★';
      const desc= v>=6?'市场领先（最佳市场实践）':v>=5?'优秀':v>=4?'良好（高于同类均值）':v>=3?'同类平均':v>0?'低于同类均值':'未评级';
      renderOut('nabers',`<span class="score">${v.toFixed(1)} ★</span><span class="lvl ${v>=6?'high':v>=4?'mid':'low'}">${desc}</span>`);
    };
    slider.addEventListener('input',upd); upd();
  }
  document.querySelectorAll('[data-anchor]').forEach(a=>{
    a.onclick=e=>{ e.preventDefault(); document.querySelector(a.getAttribute('href'))?.scrollIntoView({behavior:'smooth'}); };
  });
}

/* ============================================================
   三层自动核对
   L1 页面自检   —— 本页数据结构内部一致性（浏览器即时跑，不依赖网络）
   L2 基准比对   —— app.js 数值 vs data/facts.json（人工核对后固化的基准）
   L3 官方源巡检 —— data/audit.json（GitHub Actions 每月抓官方原文比对指纹）
============================================================ */
let AUDIT=null, FACTS=null, CHECK=null, AC_ERR='', AC_BUSY=false;

function fetchJSON(url){
  return fetch(url+'?t='+Date.now(),{cache:'no-store'}).then(r=>{
    if(!r.ok) throw new Error('HTTP '+r.status);
    return r.json();
  });
}

function loadRemote(){
  if(typeof fetch!=='function'){ return Promise.resolve(); }
  AC_BUSY=true;
  const jobs=[];
  jobs.push(fetchJSON('data/facts.json').then(d=>{FACTS=d;})
    .catch(e=>{AC_ERR='核对基准读取失败：'+e.message;}));
  jobs.push(fetchJSON('data/audit.json').then(d=>{AUDIT=d;})
    .catch(e=>{AC_ERR='巡检结果读取失败：'+e.message;}));
  return Promise.all(jobs).then(()=>{ CHECK=runChecks(); AC_BUSY=false; });
}

function sameNums(a,b){
  if(!Array.isArray(a)||!Array.isArray(b)||a.length!==b.length) return false;
  return a.every((x,i)=>Math.abs(+x-(+b[i]))<0.01);
}

function runChecks(){
  const l1=[], l2=[], l3=[], seen=new Set();
  SYSTEMS.forEach(s=>{
    const p=(label,ok,detail)=>l1.push({id:s.id,label,ok:!!ok,detail:detail||''});
    p('体系 id 唯一', !seen.has(s.id), s.id); seen.add(s.id);
    p('类别有效', !!catOf(s.cat), s.cat);
    p('依据字段完整（文件/版本/机构/链接）',
      !!(s.src&&s.src.doc&&s.src.ver&&s.src.org&&/^https?:/.test(s.src.url||'')));
    p('参评流程非空', Array.isArray(s.apply)&&s.apply.length>0);
    p('等级表非空', Array.isArray(s.levels)&&s.levels.length>0);
    p('评价指标非空', Array.isArray(s.indicators)&&s.indicators.length>0);
    p('评分标准非空', Array.isArray(s.scoring)&&s.scoring.length>0);
    p('计算器已配置', !!(s.calc&&s.calc.type));

    const th=((s.calc&&s.calc.thresholds)||[]).map(t=>t.min);
    const max=s.calc&&s.calc.total;
    if(th.length){
      p('分数线严格递增', th.every((v,i)=>i===0||v>th[i-1]), th.join(' / '));
      p('分数线不超过满分', !max||th[th.length-1]<=max, 'max='+max);
    }
    if(s.calc.type==='items'){
      const w=s.indicators.map(i=>i[1]);
      if(w.every(x=>typeof x==='number')){
        const sum=+w.reduce((a,b)=>a+b,0).toFixed(2);
        const target=s.calc.percent?100:max;
        if(target) p('权重合计＝'+(s.calc.percent?'100%':'满分'), Math.abs(sum-target)<0.6, `${sum} vs ${target}`);
      }
    }
    if(th.length && s.levels.length===th.length){
      const lows=s.levels.map(l=>{
        const m=String(l.range||'').match(/\d+(?:\.\d+)?/g); return m?+m[0]:null;
      });
      if(lows.every(x=>x!==null)) p('等级表与分数线一致', sameNums(lows,th), `${lows.join('/')} vs ${th.join('/')}`);
    }

    /* L2 */
    const f=FACTS&&(FACTS.systems||[]).find(x=>x.id===s.id);
    if(f){
      const diffs=[];
      if(f.values.max!=null&&max!=null&&f.values.max!==max) diffs.push(`满分 ${f.values.max} → ${max}`);
      if(f.values.thresholds&&!sameNums(f.values.thresholds,th)) diffs.push(`分数线 ${f.values.thresholds.join('/')} → ${th.join('/')}`);
      if(f.values.weights){
        const w=s.indicators.map(i=>i[1]);
        if(!sameNums(f.values.weights,w)) diffs.push('指标权重与基准不符');
      }
      l2.push({id:s.id,abbr:s.abbr,ok:!diffs.length,diffs});
    } else {
      l2.push({id:s.id,abbr:s.abbr,ok:false,diffs:[FACTS?'基准未收录该体系':'基准未加载']});
    }

    /* L3 */
    const a=AUDIT&&(AUDIT.systems||[]).find(x=>x.id===s.id);
    l3.push({id:s.id,abbr:s.abbr,status:a?a.status:(AUDIT?'missing':'pending'),audit:a||null});
  });
  return {l1,l2,l3,at:new Date()};
}

function l1Of(id){
  const items=(CHECK?CHECK.l1:[]).filter(x=>x.id===id);
  const bad=items.filter(x=>!x.ok);
  return {total:items.length, pass:items.length-bad.length, bad};
}

function autoState(id){
  const l2=CHECK&&CHECK.l2.find(x=>x.id===id);
  const l3=CHECK&&CHECK.l3.find(x=>x.id===id);
  if(l2&&!l2.ok) return {cls:'bad',text:'✕ 与核对基准不一致',tip:l2.diffs.join('；')};
  if(!l3||l3.status==='pending') return {cls:'warn',text:'△ 等待自动核对',tip:'正在读取核对基准与巡检结果'};
  if(l3.status==='missing') return {cls:'warn',text:'△ 巡检未覆盖',tip:'巡检结果中没有该体系'};
  const srcs=((l3.audit||{}).sources||[]);
  if(l3.status==='ok') return {cls:'ok',text:'✓ 自动核对通过',tip:'官方源正文指纹未变\n'+srcs.map(x=>x.url).join('\n')};
  if(l3.status==='archived') return {cls:'arch',text:'✓ 官方原文存档一致',tip:'线上源抓取受限，改用本地存档的官方原文比对 sha256，一致\n'+(l3.audit&&l3.audit.archive?l3.audit.archive.file:'')};
  if(l3.status==='changed') return {cls:'chg',text:'△ 官方页面有更新，待确认',tip:'官方源正文指纹变化，可能是新版发布，需人工确认后更新基准'};
  if(l3.status==='seeded') return {cls:'warn',text:'△ 指纹基线已建立',tip:'首次巡检，下一轮起可自动识别变化'};
  if(l3.status==='unreachable'){
    const m=l3.audit&&l3.audit.manual;
    const why=srcs.map(x=>naReason(x.error)).filter(Boolean)[0]||'该来源拒绝抓取/需登录/动态渲染';
    return {cls:'na',text:'⚠ 官方源抓取受限 · 已人工联网核对',
      tip:why+'\n'+(m?('人工核对日 '+m.at+'\n原文：'+m.quote+'\n'+m.url):'已转人工核对')};
  }
  return {cls:'na',text:'· 待人工核对',tip:''};
}

/* 抓取失败原因的人话解释 */
function naReason(err){
  const e=(err||'').toLowerCase();
  if(!e) return '未取到内容';
  if(e.includes('403')) return '站点返回 403，拒绝自动抓取';
  if(e.includes('timed out')||e.includes('timeout')) return '读取超时（大文件 / 站点限速）';
  if(e.includes('name resolution')||e.includes('nodename')||e.includes('-3')) return '域名解析失败（境外网络不可达）';
  if(e.includes('certificate')||e.includes('ssl')) return 'SSL 握手被拒';
  if(e.includes('reset')) return '连接被重置';
  if(e.includes('404')) return '页面已不存在';
  return err;
}

function pct(n,d){ return d?Math.round(n/d*100):0; }

function autocheckHTML(){
  if(!CHECK){
    return `<section class="ac" id="autocheck">
      <details class="fold">
        <summary class="fold-sum">
          <span class="fold-t">🛡 自动核对</span>
          <span class="fold-s">${AC_ERR?esc(AC_ERR):'正在读取核对基准与巡检结果…'}</span>
          <span class="fold-x">展开</span>
        </summary>
      </details>
    </section>`;
  }
  const l1p=CHECK.l1.filter(x=>x.ok).length, l1t=CHECK.l1.length;
  const l2p=CHECK.l2.filter(x=>x.ok).length, l2t=CHECK.l2.length;
  const oks=CHECK.l3.filter(x=>['ok','seeded','archived'].includes(x.status)).length;
  const arc=CHECK.l3.filter(x=>x.status==='archived').length;
  const chg=CHECK.l3.filter(x=>x.status==='changed').length;
  const unr=CHECK.l3.filter(x=>x.status==='unreachable').length;
  const l3t=CHECK.l3.length;
  const age=AUDIT?AUDIT.baseline_age_days:null, maxAge=AUDIT?AUDIT.max_age_days:45;
  const expired=!!(AUDIT&&AUDIT.baseline_expired);

  const rows=SYSTEMS.map(s=>{
    const one=l1Of(s.id);
    const l2=CHECK.l2.find(x=>x.id===s.id);
    const l3=CHECK.l3.find(x=>x.id===s.id);
    const a=l3&&l3.audit;
    const st=autoState(s.id);
    const na=!!(l3&&l3.status==='unreachable');
    const cells=[
      one.bad.length?`<span class="st bad" title="${esc(one.bad.map(b=>b.label+'：'+b.detail).join('\n'))}">${one.pass}/${one.total}</span>`
                    :`<span class="st ok">${one.pass}/${one.total}</span>`,
      l2&&l2.ok?`<span class="st ok">一致</span>`
               :`<span class="st bad" title="${esc((l2?l2.diffs:['未比对']).join('；'))}">不一致</span>`,
      `<span class="st ${st.cls}" title="${esc(st.tip)}">${st.text.replace(/^[✓△✕·⚠]\s*/,'')}</span>`
        ,
    ];
    const ev=(a&&a.sources&&a.sources.length)
      ? a.sources.map(x=>`<div class="ac-ev"><a href="${x.url}" target="_blank" rel="noopener">${x.url.replace(/^https?:\/\//,'').slice(0,52)}</a>
          ${x.http?`<span>HTTP ${x.http}</span>`:''}
          ${x.changed?'<b class="chg">指纹已变</b>':''}
          ${x.error?`<span class="err">${esc(naReason(x.error))}</span>`:''}
          ${x.hash?`<code>${x.hash}</code>`:''}</div>`).join('')
      : '<div class="ac-ev muted">无可机读官方源，依据人工核对</div>';
    return `<tr${na?' class="row-na"':''}>
      <td><a href="#cert-${s.id}">${s.abbr}</a></td>
      <td>${cells[0]}</td>
      <td>${cells[1]}</td>
      <td>${cells[2]}</td>
      <td><details><summary>查看</summary>${ev}</details></td>
    </tr>`;
  }).join('');

  /* 抓取受限清单：明确标注 + 说明改用的核对方式（本地存档 / 人工联网核对） */
  const limList=CHECK.l3.filter(x=>x.status==='unreachable'||x.status==='archived');
  const naBox = limList.length ? `<div class="na-box">
      <div class="na-box-t">⚠ ${limList.length} 个体系的官方源无法直接抓取 —— 已改用<b>官方原文存档</b>或<b>人工联网核对</b>，逐条标注如下</div>
      ${limList.map(x=>{
        const a=(x.audit&&x.audit.sources)||[];
        const why=a.map(y=>naReason(y.error)).filter(Boolean)[0]||'取不到内容';
        const m=x.audit&&x.audit.manual;
        const ar=x.audit&&x.audit.archive;
        const ok=x.status==='archived';
        const link=ok?((ar&&ar.url)||''):((m&&m.url)||'');
        const how=ok
          ? `本地存档的官方原文 sha256 一致（${esc(String((ar&&ar.file)||'').split('/').pop())}）`
          : (m?`按官网原文核对：${esc(m.quote)}`:'已转人工核对');
        return `<div class="na-item ${ok?'ok':'pend'}">
          <b>${x.abbr}</b>
          <span class="na-tag ${ok?'ok':'pend'}">${ok?'存档比对通过':'已人工核对'}</span>
          <span class="na-why">${esc(why)}</span>
          <span class="na-how">${how}</span>
          <span class="na-at">核对日 ${esc((m&&m.at)||x.checked_at||'—')}</span>
          ${link?`<a href="${esc(link)}" target="_blank" rel="noopener">来源 ↗</a>`:''}
        </div>`;
      }).join('')}
      <div class="na-foot">这几项不参与「正文指纹未变」的自动判定：能下载的官方原文已存档到 <code>data/refs/</code> 并校验 sha256；站点完全不可达的（如 NABERS、住建部）转人工读原文核对并记录核对日。数据本身仍受 ①自检 与 ②基准比对 双重约束。</div>
    </div>` : '';

  const banner = expired
    ? `<div class="ac-banner warn">⚠ 核对基准已 ${age} 天未复检（上限 ${maxAge} 天），建议本轮重新核对官方原文后更新 <code>data/facts.json</code>。</div>`
    : `<div class="ac-banner ok">✓ 核对基准 ${age==null?'—':age} 天前更新，在 ${maxAge} 天有效期内。</div>`;
  const errLine = AC_ERR?`<div class="ac-banner bad">${esc(AC_ERR)}（本地预览时请用 http 服务打开，file:// 无法读取 data/）</div>`:'';

  return `<section class="ac" id="autocheck">
    <details class="fold">
      <summary class="fold-sum">
        <span class="fold-t">🛡 自动核对</span>
        <span class="fold-s">① 自检 ${l1p}/${l1t} · ② 基准 ${l2p}/${l2t} · ③ 官方源 ${oks}/${l3t} 通过${unr?` · ${unr} 项抓取受限`:''}${chg?` · ${chg} 项有更新`:''}</span>
        <span class="fold-x">展开</span>
      </summary>
      <div class="fold-body">
        <div class="ac-head">
          <div class="ac-actions">
            <span class="ac-when">官方源巡检：<b>${AUDIT?esc(AUDIT.generated_at):'—'}</b> · 基准：<b>${FACTS?esc(FACTS.baseline_updated):'—'}</b></span>
            <button class="ac-btn" id="acRefresh">↻ 重新读取核对结果</button>
          </div>
        </div>
        <p class="ac-intro">每次打开本页都会自动跑三层核对：<b>① 页面自检</b>（数据结构内部一致性，浏览器本地计算）→ <b>② 基准比对</b>（页面数值与人工核对后固化的官方基准逐项对照）→ <b>③ 官方源巡检</b>（每月抓取认证机构官网原文比对正文指纹，由 GitHub Actions 执行）。</p>
        <div class="ac-cards">
          <div class="ac-card ${l1p===l1t?'ok':'bad'}">
            <div class="ac-k">① 页面自检</div>
            <div class="ac-v">${l1p}<small>/${l1t}</small></div>
            <div class="ac-d">权重合计 · 分数线递增 · 等级表↔计算器 · 依据字段</div>
          </div>
          <div class="ac-card ${l2p===l2t?'ok':'bad'}">
            <div class="ac-k">② 基准比对</div>
            <div class="ac-v">${l2p}<small>/${l2t}</small></div>
            <div class="ac-d">页面数值与官方基准一致的体系数</div>
          </div>
          <div class="ac-card ${chg?'warn':(unr?'na':'ok')}">
            <div class="ac-k">③ 官方源巡检</div>
            <div class="ac-v">${oks}<small>/${l3t}</small></div>
            <div class="ac-d">通过 ${oks}${arc?`（其中存档比对 ${arc}）`:''} · 有更新 ${chg} · 抓取受限 ${unr}</div>
          </div>
          <div class="ac-card ${expired?'warn':'ok'}">
            <div class="ac-k">基准时效</div>
            <div class="ac-v">${age==null?'—':age}<small> 天</small></div>
            <div class="ac-d">上限 ${maxAge} 天，超期自动提醒复检</div>
          </div>
        </div>
        ${errLine}${banner}${naBox}
        <table class="tbl ac-tbl">
          <tr><th>体系</th><th>① 自检</th><th>② 基准</th><th>③ 官方源</th><th>证据</th></tr>
          ${rows}
        </table>
        <div class="note">判定口径：②不一致＝页面数值被改动但未同步核对基准（红色，必须处理）；③「官方页面有更新」＝正文指纹变化（可能是新版发布，也可能是页面改版），需人工读原文确认后再 <code>--accept-changes</code>；抓取受限的体系（政府站反爬/纯 JS 渲染/需登录）转人工核对并列在上方清单，不臆断为通过。</div>
      </div>
    </details>
  </section>`;
}


$('#searchBox').addEventListener('input',e=>renderMain(e.target.value));

window.__SYSTEMS=SYSTEMS;   // 供自动核对 / 测试读取
window.__getCheck=()=>CHECK;
window.__openSet=new Set(['leed','cn3star']); // 默认展开 LEED 与绿建三星
buildSidebar();
renderMain();

/* 读取核对基准与巡检结果后重绘（失败也重绘，展示错误原因） */
loadRemote().then(()=>{ renderMain($('#searchBox').value); });

/* 手动重读（Actions 更新 audit.json 后无需刷新页面缓存） */
document.addEventListener('click',e=>{
  const btn=e.target.closest&&e.target.closest('#acRefresh');
  if(!btn||AC_BUSY) return;
  AC_ERR=''; AC_BUSY=true; btn.textContent='读取中…';
  loadRemote().then(()=>renderMain($('#searchBox').value));
});

/* 折叠区：展开/收起文案 + 锚点跳转时自动展开 */
document.addEventListener('toggle',e=>{
  const d=e.target;
  if(d&&d.tagName==='DETAILS'){
    const box=d.closest('.fold');
    if(box){ const x=box.querySelector('.fold-x'); if(x) x.textContent=d.open?'收起':'展开'; }
  }
},true);

function openFoldFor(hash){
  if(!hash||hash.charAt(0)!=='#') return;
  const el=document.querySelector(hash);
  const d=el&&el.querySelector('details.fold, .fold');
  if(d&&!d.open) d.open=true;
}
window.addEventListener('hashchange',()=>openFoldFor(location.hash));
document.addEventListener('click',e=>{
  const a=e.target.closest&&e.target.closest('a[href^="#"]');
  if(a) setTimeout(()=>openFoldFor(a.getAttribute('href')),0);
});
if(location.hash) setTimeout(()=>openFoldFor(location.hash),0);

/* 侧栏滚动高亮 */
var io=new IntersectionObserver(es=>{
  es.forEach(en=>{
    if(en.isIntersecting){
      document.querySelectorAll('.sidebar a').forEach(a=>a.classList.remove('active'));
      const a=document.querySelector(`.sidebar a[href="#${en.target.id}"]`);
      if(a)a.classList.add('active');
    }
  });
},{rootMargin:'-90px 0px -60% 0px'});
refreshObserve();

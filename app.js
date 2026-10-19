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
    ['管理 Management',12],['健康与福祉',15],['能源',15],['交通',9],['水',7],
    ['材料',15],['废弃物',8],['土地利用与生态',10],['污染',9]
  ],
  scoring:[
    '各章节得分率按<b>权重</b>加权成总分百分比，另可加创新分（最高 10%）；',
    '每个等级设有<b>强制最低得分（Mandatory Credits）</b>，总分够但强项不足会被压级；',
    '生态与能源章节需委托专业人员出具调研/模拟报告。'
  ],
  calc:{ type:'items', unit:'%', percent:true, note:'按加权得分率定级；每个等级另设强制最低分。',
    thresholds:[{min:30,lvl:'Pass'},{min:45,lvl:'Good'},{min:55,lvl:'Very Good'},{min:70,lvl:'Excellent'},{min:85,lvl:'Outstanding'}] }
},
{
  id:'dgnb', cat:'green', abbr:'DGNB', name:'DGNB',
  region:'德国 · DGNB 协会', tag:'综合可持续',
  tagline:'德国可持续建筑，强调经济、生态、社会三位一体的全生命期，欧洲高端项目常用，不是单纯拼节能。',
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
  apply:[
    '向新加坡建设局（BCA）<b>提交申请</b>并注册项目；',
    '由 BCA 认可的<b>评估师</b>按评分表逐项核算（设计阶段可先行评估）；',
    '竣工后进行<b>核验</b>确认设计措施落地；',
    '授证后有效期通常为 <b>3 年</b>，到期需复评维持等级；',
    'GM:2021 新版已转向以<b>碳排/能耗绝对表现</b>定级。'
  ],
  levels:[
    {name:'Certified 认证', range:'≥50 分', desc:'入门'},
    {name:'Gold 金',        range:'≥75 分', desc:'常规'},
    {name:'Gold★Plus 超金', range:'≥85 分', desc:'高端'},
    {name:'Platinum 白金',  range:'≥90 分', desc:'标杆'}
  ],
  indicators:[
    ['节能（含围护/空调/照明）',30],['节水',20],['材料与废弃物',15],
    ['室内环境质量',15],['环境保护与其他绿色措施',20]
  ],
  scoring:[
    '各条目累加计分，达到对应分值线即授相应等级；',
    '热带气候特色条目：<b>围护结构 OTTV/EUTV</b> 限值、空调系统综合效率等权重很高；',
    '下表分值线按旧版百分制概化，GM:2021 以能耗表现定级，仅供定位参考。'
  ],
  calc:{ type:'items', unit:'分', total:100, note:'分值线按旧版百分制概化；GM:2021 以能耗/碳排表现定级。',
    thresholds:[{min:50,lvl:'Certified'},{min:75,lvl:'Gold'},{min:85,lvl:'Gold★Plus'},{min:90,lvl:'Platinum'}] }
},
{
  id:'beam', cat:'green', abbr:'BEAM', name:'BEAM Plus',
  region:'中国香港 · HKGBC', tag:'大湾区主流',
  tagline:'香港绿色建筑认证，内地大湾区项目高度使用。',
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
    ['综合设计与建造管理',15],['可持续场地',15],['材料与废弃物',15],
    ['能源使用',25],['用水',10],['室内环境质量',20]
  ],
  scoring:[
    '按各类别得分占<b>可得学分</b>的百分比加权汇总定级；',
    '能源类别占比最高（约 1/4），且设<b>必备条款</b>；',
    '权重按新版概化，实际以现行评估手册为准。'
  ],
  calc:{ type:'items', unit:'%', percent:true, note:'按占可得学分百分比定级。',
    thresholds:[{min:40,lvl:'Bronze 铜级'},{min:55,lvl:'Silver 银级'},{min:65,lvl:'Gold 金级'},{min:75,lvl:'Platinum 铂金级'}] }
},
{
  id:'edge', cat:'green', abbr:'EDGE', name:'EDGE',
  region:'世行 IFC · GBCI 审核', tag:'低成本低成本量',
  tagline:'低成本新兴市场绿建，门槛：能耗、水、建材含能各节省至少 20%，适合地产批量项目。',
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
  apply:[
    '向澳洲绿建委员会（GBCA）<b>注册</b>并选择评价工具（Performance 运营版 / Buildings 新建版）；',
    '聘请 GBCA 认可的<b>独立评审员</b>；',
    '提交管理、能源、水、材料等类别的证明文件；',
    'GBCA 评审并授星（运营版基于 12 个月实测数据）。'
  ],
  levels:[
    {name:'4 星', range:'45–59 分', desc:'最佳实践（Best Practice）'},
    {name:'5 星', range:'60–74 分', desc:'澳洲卓越（Australian Excellence）'},
    {name:'6 星', range:'≥75 分',   desc:'世界领先（World Leadership）'}
  ],
  indicators:[
    ['管理',20],['室内环境质量',20],['能源',20],['交通',8],['水',12],
    ['材料',10],['土地与生态',5],['排放',5]
  ],
  scoring:[
    '百分制累加计分，按分值定星；',
    '低于 45 分一般不授予认证星级；',
    '权重为概化值，实际按现行技术手册执行。'
  ],
  calc:{ type:'total', unit:'分', total:100, note:'低于 45 分通常不授星。',
    thresholds:[{min:45,lvl:'4 星 · 最佳实践'},{min:60,lvl:'5 星 · 澳洲卓越'},{min:75,lvl:'6 星 · 世界领先'}] }
},
{
  id:'lbc', cat:'green', abbr:'LBC', name:'Living Building Challenge',
  region:'美国 · ILFI', tag:'极限可持续',
  tagline:'最严苛，追求净零、自给自足、生物友好，属于"极限可持续"。',
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
  apply:[
    '在 Fitwel 官网<b>注册</b>账号与项目（新建 / 既有 / 室内等多版本）；',
    '使用在线<b>记分卡（Scorecard）</b>自评逐项打分；',
    '按记分项上传平面图、照片与政策文件；',
    'Fitwel 团队<b>文件审核</b>（无现场测试），通过后授星；',
    '费用与周期显著低于 WELL，适合批量楼栋组合申报（Portfolio 方案）。'
  ],
  levels:[
    {name:'1 星', range:'90–104 分', desc:'达标'},
    {name:'2 星', range:'105–119 分', desc:'良好'},
    {name:'3 星', range:'≥120 分',   desc:'优秀（满分 144）'}
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
  calc:{ type:'total', unit:'分', total:144, note:'满分 144 分，按总分定星。',
    thresholds:[{min:90,lvl:'1 星'},{min:105,lvl:'2 星'},{min:120,lvl:'3 星'}] }
},
{
  id:'well', cat:'health', abbr:'WELL', name:'WELL（健康建筑标准）',
  region:'美国 · IWBI', tag:'健康建筑标杆',
  tagline:'健康建筑标杆体系，室内人居健康的国际金标准。',
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
    '与 Fitwel 相比：检测要求重（需第三方现场实测）、成本高，但公认度最高。'
  ],
  calc:{ type:'total', unit:'分', total:110, note:'满分 110 分；须先达成全部先决条件。',
    thresholds:[{min:40,lvl:'Bronze 铜级'},{min:50,lvl:'Silver 银级'},{min:60,lvl:'Gold 金级'},{min:80,lvl:'Platinum 铂金级'}] }
},
{
  id:'hsr', cat:'health', abbr:'WELL HSR', name:'WELL HSR',
  region:'美国 · IWBI', tag:'健康安全评价',
  tagline:'WELL 健康安全评级，侧重防疫、卫生。',
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
    '采用<b>条款达标制</b>：按主题分组的必备条款逐条达成即可授印，不设总分；',
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
  apply:[
    '聘请 <b>PHI 认证的被动房设计师/咨询机构</b>，使用 <b>PHPP</b> 能耗软件建模；',
    '设计阶段按能耗指标优化围护结构、气密性与新风热回收；',
    '施工中做<b>鼓风门气密性测试（n50）</b>与节点验收；',
    '提交 PHPP 计算书 + 现场测试报告，由 PHI 或其授权机构审核授证。'
  ],
  levels:[
    {name:'Classic 经典', range:'四项能耗指标达标', desc:'标准被动房'},
    {name:'Plus',        range:'+ 可再生能源产出 ≥60 kWh/(㎡·a)', desc:'产能进阶'},
    {name:'Premium',     range:'+ 可再生能源产出 ≥120 kWh/(㎡·a)', desc:'正产能建筑'}
  ],
  indicators:[
    ['采暖需求 ≤15 kWh/(㎡·a)',15],['采暖负荷 ≤10 W/㎡',10],
    ['气密性 n50 ≤0.6 /h',0],['一次能源（可再生）PER ≤60 kWh/(㎡·a)',60]
  ],
  scoring:[
    '不打分，采用<b>硬指标达标制</b>：采暖需求、采暖负荷、气密性、PER 四项须全部满足；',
    '在 Classic 基础上按可再生能源设备产出划分 Plus / Premium；',
    '制冷需求、湿度等亦有相应限值（视气候区）。'
  ],
  calc:{ type:'check', title:'核心能耗指标（达标请勾选）',
    items:[
      {k:'h',label:'采暖需求 ≤15 kWh/(㎡·a)',small:'PHPP 计算的年采暖需求'},
      {k:'l',label:'采暖负荷 ≤10 W/㎡',small:'极端天气下的峰值热负荷'},
      {k:'a',label:'气密性 n50 ≤0.6 /h',small:'鼓风门实测结果'},
      {k:'p',label:'一次能源（可再生）PER ≤60 kWh/(㎡·a)'},
      {k:'r60',label:'可再生能源设备产出 ≥60 kWh/(㎡·a)',small:'光伏等年产能（影响 Plus/Premium）'},
      {k:'r120',label:'可再生能源设备产出 ≥120 kWh/(㎡·a)'}
    ],
    result(c){
      if(!(c.h&&c.l&&c.a&&c.p))
        return {ok:false, txt:'❌ 四项核心指标（采暖需求/采暖负荷/气密性/PER）须<b>全部达标</b>方可获得被动房认证。'};
      if(c.r120) return {ok:true, txt:'🏆 核心指标全部达标 + 可再生能源产出 ≥120 → 可认证 <b>Premium</b>（正产能建筑）。'};
      if(c.r60)  return {ok:true, txt:'✅ 核心指标全部达标 + 可再生能源产出 ≥60 → 可认证 <b>Plus</b>。'};
      return {ok:true, txt:'✅ 四项核心指标全部达标 → 可认证 <b>Classic 经典被动房</b>。'};
    }
  }
},
{
  id:'nabers', cat:'spec', abbr:'NABERS', name:'NABERS',
  region:'澳大利亚 · NSW 政府管理', tag:'实测运行性能',
  tagline:'建筑实际运行能耗星级（实测性能）。',
  apply:[
    '面向<b>已运营 ≥12 个月</b>的建筑（办公、酒店、数据中心等）；',
    '聘请 NABERS <b>认证评估师</b>采集 12 个月实测能耗/水/废弃物数据；',
    '与同气候区同类型建筑<b>基准数据库</b>比对排名；',
    '授星并载入公开注册名录，有效期约 1 年，可持续复评。'
  ],
  levels:[
    {name:'6 星', desc:'市场领先（楼宇性能居同类前 6% 左右）'},
    {name:'5 星', desc:'优秀'},
    {name:'4 星', desc:'良好（同类平均水平之上）'},
    {name:'3 星', desc:'同类平均水平'},
    {name:'2 星及以下', desc:'落后于同类均值'}
  ],
  indicators:[
    ['能耗（Energy）'],['水（Water）'],['废弃物（Waste）'],['室内环境（IEQ）']
  ],
  scoring:[
    '以<b>实测数据</b>而非设计值评级，0.5 星为最小刻度（0.5–6 星）；',
    '排名式评级：得分取决于与同类建筑年际数据比较的相对位置；',
    '可按"整楼"或"租户部分"分别评级。'
  ],
  calc:{ type:'nabers' }
},
{
  id:'energystar', cat:'spec', abbr:'ES', name:'ENERGY STAR',
  region:'美国 · EPA 环保署', tag:'能效标识',
  tagline:'美国建筑能效标识。',
  apply:[
    '在 EPA <b>Portfolio Manager</b> 平台录入建筑 12 个月实测能耗数据；',
    '系统按同类型建筑分布自动给出 <b>1–100 能效得分</b>；',
    '得分 ≥75 可申请认证，并由<b>注册工程师（PE/CES）</b>核查数据；',
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
  apply:[
    '在 GBCI（与 LEED 同一审核机构）<b>注册</b>项目；',
    '聘请 <b>SITES AP</b>（可持续场地专业人员）；',
    '完成先决条件并按评分项收集设计/施工文档；',
    '分阶段（设计 / 施工）提交审核，通过后授证。'
  ],
  levels:[
    {name:'Certified 认证', range:'70–89 分', desc:'入门'},
    {name:'Silver 银级',    range:'90–109 分', desc:'常规'},
    {name:'Gold 金级',      range:'110–134 分', desc:'主流目标'},
    {name:'Platinum 铂金级', range:'≥135 分', desc:'标杆'}
  ],
  indicators:[
    ['场地背景与前决条件'],['预先设计'],['场地设计'],['施工'],['运营维护'],['监测与创新']
  ],
  scoring:[
    '满分 200 分 + 10 分超额加分，先决条件必须全部满足；',
    '核心评价：土壤与植被保护、雨水管理、景观节水和生态修复；',
    '与 LEED 得分点可互相支持，常见"LEED + SITES"组合申报。'
  ],
  calc:{ type:'total', unit:'分', total:210, note:'满分 200+10 分；先决条件须全部满足。',
    thresholds:[{min:70,lvl:'Certified 认证'},{min:90,lvl:'Silver 银级'},{min:110,lvl:'Gold 金级'},{min:135,lvl:'Platinum 铂金级'}] }
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
  let h='<div class="grp">快速对比</div><a href="#compare" data-anchor>一句话区分</a>';
  CATS.forEach(c=>{
    h+=`<div class="grp">${c.name}</div>`;
    SYSTEMS.filter(s=>s.cat===c.id).forEach(s=>{
      h+=`<a href="#cert-${s.id}" data-anchor>${s.abbr} · ${s.name.split('（')[0]}</a>`;
    });
  });
  $('#sidebar').innerHTML=h;
}

function catOf(id){return CATS.find(c=>c.id===id);}

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
  $('#main').innerHTML=cmpHTML()+h;
  bindEvents();
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
    inner=`<div class="calc-item"><label>总分（${k.unit}）</label><input type="number" min="0" max="${k.total}" value="0" data-ci="0"><span class="max">满分 ${k.total}</span></div>`;
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
      const desc= v>=6?'市场领先（前 6% 左右）':v>=5?'优秀':v>=4?'良好（高于同类均值）':v>=3?'同类平均水平':v>0?'低于同类均值':'未评级';
      renderOut('nabers',`<span class="score">${v.toFixed(1)} ★</span><span class="lvl ${v>=6?'high':v>=4?'mid':'low'}">${desc}</span>`);
    };
    slider.addEventListener('input',upd); upd();
  }
  document.querySelectorAll('[data-anchor]').forEach(a=>{
    a.onclick=e=>{ e.preventDefault(); document.querySelector(a.getAttribute('href'))?.scrollIntoView({behavior:'smooth'}); };
  });
}

/* ---------- 搜索 & 滚动高亮 ---------- */
$('#searchBox').addEventListener('input',e=>renderMain(e.target.value));

window.__openSet=new Set(['leed','cn3star']); // 默认展开 LEED 与绿建三星
buildSidebar();
renderMain();

/* 侧栏滚动高亮 */
const io=new IntersectionObserver(es=>{
  es.forEach(en=>{
    if(en.isIntersecting){
      document.querySelectorAll('.sidebar a').forEach(a=>a.classList.remove('active'));
      const a=document.querySelector(`.sidebar a[href="#${en.target.id}"]`);
      if(a)a.classList.add('active');
    }
  });
},{rootMargin:'-90px 0px -60% 0px'});
document.querySelectorAll('.cert,.compare').forEach(el=>io.observe(el));

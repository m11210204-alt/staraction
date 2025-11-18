import { type ConstellationData, ActionStatus } from '../types';

export const mockConstellations: ConstellationData[] = [
  {
    id: "const-1",
    name: "讓好傢俱重拾價值，成為花蓮光復災後重建的支持",
    category: "社會福利",
    region: "花蓮",
    status: ActionStatus.IN_PROGRESS,
    summary: "一起捐出閒置傢俱，讓真正需要的人重新擁有「家的樣子」，你的善意，我們幫你安全送達。",
    background: "花蓮光復地區經歷災害後，許多家庭與社福據點急需基本生活傢俱重建空間。但購置與運送成本高，重建過程因此困難重重。\n同時，許多家庭和企業都有狀況良好的閒置傢俱。透過媒合與物流協力，這些資源可以有效流通，減少浪費，成為另一個家庭的希望。",
    goals: [
        "協助災區與社福單位快速恢復居住與服務空間。",
        "延續二手傢俱的使用壽命，實踐循環經濟。",
        "結合公益與減碳，讓善意被看見、資源被善用。",
        "建立一套「可信、透明、可追蹤」的捐贈流程，鼓勵更多人參與。"
    ],
    howToParticipate: "✅ 捐出基本傢俱（床、沙發、桌椅、收納櫃等）\n✅ 線上填表一次完成捐贈資訊登記與物流評估\n✅ 自行送貨或委託合作搬家公司（含到府評估與運送）\n✅ 無論是企業或個人，我們都提供完整送達證明與成果回報\n\n📌 **不收項目提醒**：鋼琴、大型酒櫃、破損或無法使用之家具，以及需拆卸之系統家具\n\n---\n\n讓我們一起，用一張桌子、一張床、一個收納櫃，幫助災後家戶找回生活的秩序與溫度。\n👉 現在就填寫表單加入捐贈行動：\nhttps://app.gddao.com/supply-donations",
    initiator: "好事道",
    participants: [
      { id: "p1", key: "p1-c1", pointIndex: 0 },
      { id: "p2", key: "p2-c1", pointIndex: 2 },
      { id: "p3", key: "p3-c1", pointIndex: 4 },
      { id: "p4", key: "p4-c1", pointIndex: 6 },
      { id: "user_jw", key: "user_jw-c1", pointIndex: 8 },
      { id: "p6", key: "p6-c1", pointIndex: 1 },
      { id: "p7", key: "p7-c1", pointIndex: 3 },
      { id: "p8", key: "p8-c1", pointIndex: 5 },
      { id: "p9", key: "p9-c1", pointIndex: 7 },
      { id: "p10", key: "p10-c1", pointIndex: 9 },
      { id: "p11", key: "p11-c1", pointIndex: 10 },
      { id: "p12", key: "p12-c1", pointIndex: 11 },
      { id: "p13", key: "p13-c1", pointIndex: 12 },
      { id: "p14", key: "p14-c1", pointIndex: 13 },
      { id: "p15", key: "p15-c1", pointIndex: 0 },
    ],
    maxParticipants: 40,
    shapePoints: [
      { x: 15, y: 75 }, { x: 85, y: 75 }, { x: 95, y: 65 }, { x: 25, y: 65 }, { x: 15, y: 75 },
      { x: 15, y: 55 }, { x: 25, y: 45 }, { x: 25, y: 25 }, { x: 95, y: 25 }, { x: 95, y: 45 },
      { x: 85, y: 55 }, { x: 15, y: 55 }, { x: 85, y: 55 }, { x: 85, y: 75 }
    ],
    comments: [
      { id: "c1", author: "王小姐", avatar: "https://loremflickr.com/40/40/portrait?random=1", text: "家裡剛好有張用不到的八成新桌子，這個平台太方便了！" },
      { id: "c2", author: "陳先生", avatar: "https://loremflickr.com/40/40/portrait?random=2", text: "請問收不收雙人床墊呢？狀況良好。" },
    ],
    updates: [
      { date: "2025-11-15", text: "🚚 第二批次傢俱已出發！感謝各位的愛心。" },
      { date: "2025-11-10", text: "🎉 第一批傢俱已成功送達花蓮光復第一戶受災家庭！" },
    ],
    uploads: [
      { id: "u1", url: "https://loremflickr.com/200/200/logo,minimalist?lock=10", caption: "好事道 Logo" },
      { id: "u2", url: "https://loremflickr.com/200/200/moving,truck,furniture?lock=11", caption: "物流夥伴運送中" },
    ],
    resources: [
      { id: "r1", type: "人力", description: "大愛搬家專業清運", provider: "大愛搬家" },
    ],
  },
  {
    id: "const-2",
    name: "毛孩森活探索隊（體驗場）：一起來森林認識狗狗吧！",
    category: "動物保護",
    region: "台南",
    status: ActionStatus.PENDING,
    summary: "想養狗卻還不確定？這場活動讓你親身接觸米克斯，在互動中找到答案 🐶🌳",
    background: "你是否想過：\n\n- 我真的準備好養狗了嗎？\n- 米克斯親人嗎？好教嗎？\n- 看照片很難知道合不合？\n\n這場體驗活動，就是為你設計的！\n在台南仁德的「毛孩森活村」，你可以實際和米克斯互動，了解牠的個性、生活習慣，看看你們合不合適。\n\n這裡就像一座魔法森林，讓人和狗自然相遇，產生連結。你可以帶著家人朋友一起來，花一個下午，感受「家」可能的樣子。",
    goals: [
        "幫助大家認識米克斯、了解養狗的責任",
        "用互動代替想像，找到真正合得來的狗狗",
        "讓收養變得更有信心、更少後悔",
    ],
    howToParticipate: "📍**活動資訊**\n- 日期：2025/11/22（六）14:00-16:30（13:30 開始報到）\n- 地點：台南市仁德區二仁路一段333之1號（毛孩森活村）\n- 費用：免費\n- 限額：12 組家庭\n\n💡**活動內容**\n- 認識米克斯：了解狗狗行為，學習互動技巧\n- 配對互動：由訓練師協助，找到最合拍的狗\n- 模擬生活：一起坐在沙發上，預演你們的日常\n- 森林任務：完成小挑戰，建立信任感\n- 領養說明：心動了？我們會告訴你怎麼帶牠回家\n\n👩‍🏫 **指導老師**\n- 訓練師高婉婷\n- 擅長幼犬教養、多犬互動，有專業認證\n\n🚗 **交通建議**\n- 自行開車或騎車都方便，近奇美博物館，場內有停車位\n\n📱 **追蹤我們**\n- Facebook: 毛孩森活村\n- Instagram: rendehappytailsvillage",
    initiator: "IxDA Taiwan",
    participants: [
      { id: "p1", key: "p1-c2", pointIndex: 3 },
      { id: "p2", key: "p2-c2", pointIndex: 9 },
      { id: "p3", key: "p3-c2", pointIndex: 0 },
      { id: "p4", key: "p4-c2", pointIndex: 1 },
      { id: "p5", key: "p5-c2", pointIndex: 2 },
      { id: "p6", key: "p6-c2", pointIndex: 4 },
      { id: "p7", key: "p7-c2", pointIndex: 5 },
      { id: "p8", key: "p8-c2", pointIndex: 6 },
      { id: "p9", key: "p9-c2", pointIndex: 7 },
      { id: "p10", key: "p10-c2", pointIndex: 8 },
      { id: "p11", key: "p11-c2", pointIndex: 10 },
      { id: "p12", key: "p12-c2", pointIndex: 11 },
      { id: "p13", key: "p13-c2", pointIndex: 12 },
    ],
    maxParticipants: 45,
    shapePoints: [
      { x: 30, y: 20 }, { x: 15, y: 35 }, { x: 30, y: 50 }, { x: 60, y: 50 },
      { x: 85, y: 30 }, { x: 75, y: 50 }, { x: 75, y: 75 }, { x: 65, y: 75 },
      { x: 65, y: 55 }, { x: 40, y: 55 }, { x: 40, y: 75 }, { x: 30, y: 75 },
      { x: 30, y: 50 }, { x: 45, y: 22 }, { x: 30, y: 20 }, { x: 75, y: 50 }
    ],
    comments: [],
    updates: [{ date: "2025-11-05", text: "🎉 本場登場的狗狗共 12 位\n奶茶、灰灰、瓦斯...都準備好認識新家人了！\n\n🐾 每隻狗狗都做過健康檢查，也有基本訓練\n我們會誠實告訴你牠們的個性與小脾氣\n\n🌟 毛孩森活村不只是中途之家，更像是養狗的預備學校" }],
    uploads: [{ id: "u1", url: "https://loremflickr.com/200/200/dog,forest?lock=3", caption: "在森林裡與狗狗相遇" }],
    resources: [
        { id: "r1", type: "人力", description: "D.I.N.G.O. Taiwan 專業訓犬師", provider: "D.I.N.G.O. Taiwan" },
        { id: "r2", type: "人力", description: "活動合作夥伴", provider: "毛孩 Minibar" },
    ],
  },
  {
    id: "const-3",
    name: "建構安全無害的永續校園｜國泰人壽",
    category: "教育支持",
    region: "全台",
    status: ActionStatus.IN_PROGRESS,
    summary: "用反毒、反詐教育守護孩子的校園生活，讓他們健康、自信長大！",
    background: "台灣面臨兩大青少年風險：毒品與詐騙。\n根據警政署統計，每五位吸毒者中就有一位在 19 歲前接觸毒品；同時，詐騙手法越來越多樣化，未成年受害人也持續增加。\n\n國泰人壽結合政府、學校、企業資源，從「健康促進」與「財務健康」兩大方向出發，用有趣互動的方式教孩子識毒、拒毒、防詐。目標是讓每所校園都更安全、更有保障。\n\n除了學生團保保障近 300 萬名學生外，也透過各種遊戲式教材與培訓工作坊，幫助孩子與老師建立正確觀念。",
    goals: [
        "🎯 建立青少年對毒品與詐騙的辨識與防範能力",
        "🎯 落實校園健康與財務安全教育",
        "🎯 透過互動學習方式，提升教學效果與參與度",
        "🎯 推動永續校園，讓教育成為改變的力量"
    ],
    howToParticipate: "📚 我們推動的行動內容：\n\n#### 🧩 反毒桌遊教學\n- 與社企「玩轉學校」合作，設計桌遊教材，帶領學生討論可能遇到的毒品情境。\n- 舉辦工作坊，培訓中小學老師能用遊戲帶領反毒課程。\n\n#### 🧠 反詐桌遊推廣\n- 和警政署刑事局、台大等單位合作設計詐騙情境遊戲。\n- 由警察分享真實案例，讓學習更貼近現實，幫助識破詐騙手法。\n\n#### 🎮 反毒電競遊戲\n- 與 PaGamO 平台合作設計「反毒闖關遊戲」，邊玩邊學習反毒知識。\n- 內容由專家設計 440 題題庫，幫助學生全面理解毒品風險。\n\n🙌 對象\n- 國小、國中、高中學生\n- 教師與教育工作者（可成為永續種子教師）\n\n📍 服務地區\n全台皆可參與：北、中、南、東與離島地區",
    initiator: "國泰人壽",
    participants: [
        { id: "p1", key: "p1-c3", pointIndex: 0 },
        { id: "p2", key: "p2-c3", pointIndex: 4 },
        { id: "p3", key: "p3-c3", pointIndex: 8 },
        { id: "user_jw", key: "user_jw-c3", pointIndex: 10 },
        { id: "p5", key: "p5-c3", pointIndex: 1 },
        { id: "p6", key: "p6-c3", pointIndex: 2 },
        { id: "p7", key: "p7-c3", pointIndex: 3 },
        { id: "p8", key: "p8-c3", pointIndex: 5 },
        { id: "p9", key: "p9-c3", pointIndex: 6 },
        { id: "p10", key: "p10-c3", pointIndex: 7 },
        { id: "p11", key: "p11-c3", pointIndex: 9 },
        { id: "p12", key: "p12-c3", pointIndex: 11 },
        { id: "p13", key: "p13-c3", pointIndex: 12 },
        { id: "p14", key: "p14-c3", pointIndex: 13 },
        { id: "p15", key: "p15-c3", pointIndex: 14 },
    ],
    maxParticipants: 55,
    shapePoints: [
      // --- Outer Shape (Shifted up by 20px) ---
      { x: 40, y: 75 }, // 1. Bottom-left root
      { x: 45, y: 55 }, // 2. Top-left of trunk
      // Canopy - Left Side (scalloped)
      { x: 15, y: 50 }, // 3. Bottom-left scallop
      { x: 20, y: 30 }, // 4. Mid-left scallop
      { x: 35, y: 10 }, // 5. Top-left scallop
      // Canopy - Top
      { x: 50, y: 5 },  // 6. Peak of tree
      // Canopy - Right Side (scalloped)
      { x: 65, y: 10 }, // 7. Top-right scallop
      { x: 80, y: 30 }, // 8. Mid-right scallop
      { x: 85, y: 50 }, // 9. Bottom-right scallop
      // Trunk - Right side
      { x: 55, y: 55 }, // 10. Top-right of trunk
      { x: 60, y: 75 }, // 11. Bottom-right root
      // --- Inner Arc for Layered Effect (using trace-back) ---
      { x: 55, y: 55 }, // 12. Move back to top-right of trunk
      { x: 70, y: 40 }, // 13. Start of inner arc (right)
      { x: 50, y: 25 }, // 14. Middle of inner arc
      { x: 30, y: 40 }, // 15. End of inner arc (left)
      { x: 45, y: 55 }, // 16. Connect back to top-left of trunk
    ],
    comments: [],
    updates: [{ date: "2025-11-20", text: "✅ 已與教育部及多所學校合作，辦理教師培訓與教具推廣\n✅ 全面推廣電競與桌遊學習模式，深受學生喜愛\n✅ 結合真實案例、遊戲互動、專家設計，學習效果顯著" }],
    uploads: [],
    resources: [],
  },
  {
    id: "const-4",
    name: "打造綠色供應鏈，企業 ESG 永續行動就從「循環包裝」開始！",
    category: "環境永續",
    region: "全台",
    status: ActionStatus.PENDING,
    summary: "配客嘉協助企業減碳、減廢、支持弱勢，一站式實踐 ESG，讓永續行動變得簡單有力。",
    background: "隨著全球對淨零碳排與 ESG 要求日益提升，許多企業在減碳（尤其是範疇三）、公益參與與供應鏈永續上面臨挑戰。一次性包材使用不僅增加碳排放，也帶來廢棄物問題與資源浪費。\n\n配客嘉，身為全台領先的循環包裝品牌，整合再生材料製成的循環箱、綠色製造流程與社福單位合作，打造完整的責任供應鏈，讓企業從日常出貨中就能實踐永續價值。",
    goals: [
        "降低供應鏈碳排放（平均減少 50.6%）",
        "減少一次性紙箱使用與垃圾量",
        "提供弱勢族群穩定就業機會",
        "提供碳排放數據追蹤，協助企業製作永續報告書",
        "將 ESG 精神融入企業文化與品牌日常"
    ],
    howToParticipate: "只需輸入貴公司每月平均出貨量，即可估算：\n\n- 每月可減少多少碳排放\n- 能提供多少個弱勢就業機會\n\n👉 [馬上填寫表單，啟動您的 ESG 行動](#)\n\n---\n\n如您有意了解更多或獲取專屬成功案例，歡迎聯絡配客嘉，我們將協助您快速、有效地開啟 ESG 永續旅程。\n\n📩 [service@packageplus-tw.com](mailto:service@packageplus-tw.com)｜📞 02-7728-6182",
    initiator: "配客嘉",
    participants: [
        { id: "p1", key: "p1-c4", pointIndex: 0 },
        { id: "p2", key: "p2-c4", pointIndex: 1 },
        { id: "p3", key: "p3-c4", pointIndex: 2 },
        { id: "p4", key: "p4-c4", pointIndex: 3 },
        { id: "p5", key: "p5-c4", pointIndex: 4 },
        { id: "p6", key: "p6-c4", pointIndex: 5 },
        { id: "p7", key: "p7-c4", pointIndex: 6 },
        { id: "p8", key: "p8-c4", pointIndex: 7 },
        { id: "p9", key: "p9-c4", pointIndex: 8 },
        { id: "p10", key: "p10-c4", pointIndex: 9 },
        { id: "p11", key: "p11-c4", pointIndex: 10 },
        { id: "p12", key: "p12-c4", pointIndex: 11 },
    ],
    maxParticipants: 35,
    shapePoints: [
        { x: 20, y: 70 }, { x: 80, y: 70 }, { x: 95, y: 55 }, { x: 35, y: 55 }, { x: 20, y: 70 },
        { x: 20, y: 30 }, { x: 80, y: 30 }, { x: 95, y: 15 }, { x: 35, y: 15 }, { x: 20, y: 30 },
        { x: 80, y: 70 }, { x: 80, y: 30 }, { x: 95, y: 55 }, { x: 95, y: 15 },
        { x: 35, y: 55 }, { x: 35, y: 15 }
    ],
    comments: [],
    updates: [
        { date: "2025-11-29", text: "台積電：導入循環箱，年減逾 3 萬個紙箱，並與社福單位合作清潔箱體" },
        { date: "2025-11-22", text: "光寶科：全面改用循環包裝，導入品牌店出貨流程，深化企業 ESG 文化" },
        { date: "2025-11-15", text: "聯電：推動場內循環專案，強化上下游 ESG 整合" },
    ],
    uploads: [],
    resources: [],
  },
];
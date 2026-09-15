import { PrismaClient, CommunicationPreference, ExperienceLevel, RoleType, UserTopicPurpose, CoffeeRequestStatus } from "@prisma/client";
import { hashSync } from "bcryptjs";
import { subDays, subHours } from "date-fns";

const prisma = new PrismaClient();

const topicNames = [
  "职业发展",
  "产品经理",
  "创业",
  "投资",
  "互联网",
  "人工智能",
  "出海",
  "品牌营销",
  "数据分析",
  "设计",
  "学术研究",
  "个人成长",
  "自由职业",
  "内容创作",
  "海外生活",
];

const image = (prompt: string, size = "landscape_4_3") =>
  `https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=${encodeURIComponent(prompt)}&image_size=${size}`;

const users = [
  {
    name: "林知夏",
    email: "lin@coffeechat.demo",
    city: "上海",
    organization: "沐光科技",
    role: "AI 产品经理",
    roleType: RoleType.PRODUCT,
    yearsOfExperience: ExperienceLevel.MID,
    bio: "做 AI 工具和知识工作流，喜欢把复杂问题讲清楚。",
    background: "之前在教育科技公司做增长和产品，过去两年开始负责 AI Copilot 产品，从 0 到 1 搭过一支小团队。",
    peopleToMeet: "想认识正在做 AI 应用、B2B SaaS、内容产品的人，也欢迎想转产品的朋友。",
    communicationPreference: CommunicationPreference.BOTH,
    languages: "中文, English",
    isOpenToCoffeeChat: true,
    offerTopics: ["产品经理", "人工智能", "职业发展", "互联网"],
    interestTopics: ["创业", "内容创作", "品牌营销"],
  },
  {
    name: "陈牧远",
    email: "chen@coffeechat.demo",
    city: "北京",
    organization: "北辰资本",
    role: "投资分析师",
    roleType: RoleType.INVESTOR,
    yearsOfExperience: ExperienceLevel.MID,
    bio: "关注 AI、企业服务和出海，希望多认识一线创业者。",
    background: "曾在咨询公司做 TMT 项目，现在在早期基金看项目，日常会陪被投公司做产品和融资材料。",
    peopleToMeet: "想认识做企业服务、消费科技、出海品牌的创始人和产品负责人。",
    communicationPreference: CommunicationPreference.OFFLINE,
    languages: "中文, English",
    isOpenToCoffeeChat: true,
    offerTopics: ["投资", "创业", "出海", "职业发展"],
    interestTopics: ["人工智能", "品牌营销", "互联网"],
  },
  {
    name: "周也",
    email: "zhou@coffeechat.demo",
    city: "杭州",
    organization: "字节跳动",
    role: "数据分析师",
    roleType: RoleType.OPERATIONS,
    yearsOfExperience: ExperienceLevel.MID,
    bio: "喜欢用数据帮业务做决策，也爱研究城市里的好咖啡馆。",
    background: "本科统计学，毕业后一直在互联网做分析，经历过电商和内容平台业务。",
    peopleToMeet: "想认识关注数据产品、增长、内容策略的人。",
    communicationPreference: CommunicationPreference.BOTH,
    languages: "中文",
    isOpenToCoffeeChat: true,
    offerTopics: ["数据分析", "互联网", "职业发展"],
    interestTopics: ["产品经理", "个人成长", "人工智能"],
  },
  {
    name: "许清禾",
    email: "xu@coffeechat.demo",
    city: "深圳",
    organization: "自由职业",
    role: "品牌与内容顾问",
    roleType: RoleType.FREELANCER,
    yearsOfExperience: ExperienceLevel.SENIOR,
    bio: "帮助品牌做定位和内容叙事，也在认真经营自己的小 newsletter。",
    background: "做过 6 年品牌营销，服务过消费品牌和教育公司，去年开始自由职业，客户大多来自朋友介绍。",
    peopleToMeet: "想认识独立创作者、消费品牌操盘手、自由职业者。",
    communicationPreference: CommunicationPreference.BOTH,
    languages: "中文",
    isOpenToCoffeeChat: true,
    offerTopics: ["品牌营销", "内容创作", "自由职业", "个人成长"],
    interestTopics: ["出海", "设计", "创业"],
  },
  {
    name: "唐栗",
    email: "tang@coffeechat.demo",
    city: "成都",
    organization: "西南交通大学",
    role: "博士后研究员",
    roleType: RoleType.RESEARCH,
    yearsOfExperience: ExperienceLevel.SENIOR,
    bio: "做人机交互和认知科学，也愿意聊学术之外的人生规划。",
    background: "在新加坡完成博士，研究方向是 HCI 和学习科学，近期在做 AI 时代的学习体验研究。",
    peopleToMeet: "想认识愿意把学术转化成产品的人，也想和做教育创新的团队聊聊。",
    communicationPreference: CommunicationPreference.ONLINE,
    languages: "中文, English",
    isOpenToCoffeeChat: true,
    offerTopics: ["学术研究", "人工智能", "个人成长"],
    interestTopics: ["产品经理", "设计", "海外生活"],
  },
  {
    name: "叶青澜",
    email: "ye@coffeechat.demo",
    city: "广州",
    organization: "海岸设计",
    role: "体验设计负责人",
    roleType: RoleType.DESIGN,
    yearsOfExperience: ExperienceLevel.LEAD,
    bio: "做过 B 端和消费产品设计，最近沉迷研究服务体验与空间叙事。",
    background: "从 UI 设计一路做到设计管理，带过跨职能团队，也和创业公司共创过设计系统。",
    peopleToMeet: "想认识 PM、创业者、品牌和空间体验方向的朋友。",
    communicationPreference: CommunicationPreference.OFFLINE,
    languages: "中文, English",
    isOpenToCoffeeChat: true,
    offerTopics: ["设计", "职业发展", "品牌营销"],
    interestTopics: ["创业", "内容创作", "个人成长"],
  },
  {
    name: "宋言",
    email: "song@coffeechat.demo",
    city: "上海",
    organization: "远舟出海",
    role: "增长负责人",
    roleType: RoleType.MARKETING,
    yearsOfExperience: ExperienceLevel.SENIOR,
    bio: "专注 DTC 和 SaaS 出海增长，热爱拆解品牌与用户关系。",
    background: "之前在跨境电商平台做用户增长，后来转去 SaaS 公司负责海外市场进入和内容增长。",
    peopleToMeet: "想认识做海外增长、品牌内容、独立站和 AI 营销工具的人。",
    communicationPreference: CommunicationPreference.BOTH,
    languages: "中文, English",
    isOpenToCoffeeChat: true,
    offerTopics: ["出海", "品牌营销", "内容创作", "数据分析"],
    interestTopics: ["投资", "创业", "人工智能"],
  },
  {
    name: "顾安",
    email: "gu@coffeechat.demo",
    city: "苏州",
    organization: "个人项目",
    role: "独立开发者",
    roleType: RoleType.CREATOR,
    yearsOfExperience: ExperienceLevel.MID,
    bio: "白天写代码，晚上做 side project，最近在打磨一个面向创作者的小工具。",
    background: "曾在 SaaS 创业公司做前端和全栈，现在半自由职业，常年混迹各类 maker 社区。",
    peopleToMeet: "想认识独立开发者、内容创作者、愿意一起做小产品的人。",
    communicationPreference: CommunicationPreference.BOTH,
    languages: "中文, English",
    isOpenToCoffeeChat: false,
    offerTopics: ["互联网", "创业", "内容创作", "自由职业"],
    interestTopics: ["投资", "品牌营销", "人工智能"],
  },
];

const posts = [
  {
    authorEmail: "lin@coffeechat.demo",
    title: "第一次把 AI 助手真正落到团队工作流里，我学到的 3 件事",
    content: "过去半年我们不是在做“会聊天”的产品，而是在做能让团队少开会、少同步、少返工的工具。真正有效的点，不在模型多强，而在流程有没有被接住。最近很想聊聊：AI 产品到底该从场景切入，还是先从能力切入？",
    topics: ["人工智能", "产品经理", "互联网"],
    coverImageUrl: image("warm coffee shop table with laptop notebook and subtle AI product planning sketches realistic editorial photography"),
  },
  {
    authorEmail: "chen@coffeechat.demo",
    title: "最近看早期项目，最打动我的反而不是 pitch deck",
    content: "有些团队材料很完整，但聊完还是感受不到用户价值；也有创始人表达没那么 polished，却能把客户痛点讲得很真。我越来越在意的是：你有没有走进过用户真实的一天。欢迎来聊融资前准备、投资人视角和产品验证。",
    topics: ["投资", "创业", "职业发展"],
    coverImageUrl: image("minimal cafe meeting between investor and founder, coffee cups and notebook on wooden table, realistic lifestyle photo"),
  },
  {
    authorEmail: "zhou@coffeechat.demo",
    title: "数据分析不是做报表，真正难的是定义问题",
    content: "最近带同事复盘一个增长项目，发现大家最容易跳过的步骤就是“先把问题问对”。如果你也在做增长、内容、电商或者产品分析，很想听听你们是怎么把模糊目标拆成可验证假设的。",
    topics: ["数据分析", "互联网", "职业发展"],
  },
  {
    authorEmail: "xu@coffeechat.demo",
    title: "自由职业一年后，我开始更重视稳定节奏而不是更高单价",
    content: "刚开始自由职业时，什么单都想接，后来发现真正决定状态的不是收入天花板，而是有没有稳定输出、稳定客户和稳定生活节奏。最近在整理一套适合内容和品牌顾问的轻量工作系统。",
    topics: ["自由职业", "品牌营销", "个人成长"],
    coverImageUrl: image("cozy freelancer workspace with coffee, journal, sunlight, warm neutral tones, realistic"),
  },
  {
    authorEmail: "tang@coffeechat.demo",
    title: "做学术的人，为什么也应该多和产品团队喝咖啡",
    content: "学术和产品之间经常隔着一层语言系统。研究者讲机制，产品团队讲用户价值，但本质上都在回答“这个改变为什么重要”。我越来越觉得，好的 Coffee Chat 可以缩短这种翻译成本。",
    topics: ["学术研究", "人工智能", "设计"],
  },
  {
    authorEmail: "ye@coffeechat.demo",
    title: "设计负责人最容易忽略的，其实是团队情绪设计",
    content: "流程、评审和规范当然重要，但团队协作里更隐性的，是大家在讨论里是否有安全感。最近我在试着把设计评审做得更像一次共创，而不是打分现场。",
    topics: ["设计", "职业发展", "个人成长"],
    coverImageUrl: image("design review in a warm studio with printed mockups, coffee mugs, collaborative atmosphere, realistic photo"),
  },
  {
    authorEmail: "song@coffeechat.demo",
    title: "出海增长里，内容团队和广告团队为什么总是对不上",
    content: "很多团队以为是 KPI 不一致，真正的问题往往是用户洞察没有共用。最近在帮一个品牌梳理从站外内容到落地页转化的叙事链路，发现“谁在说、对谁说、在哪说”这三个问题必须一次讲清楚。",
    topics: ["出海", "品牌营销", "内容创作"],
  },
  {
    authorEmail: "gu@coffeechat.demo",
    title: "一个独立开发者最近的困惑：是继续打磨产品，还是先做分发",
    content: "我总忍不住继续加功能，但用户其实更关心的是：你到底解决了什么问题。最近在强迫自己每周花固定时间去做用户访谈和内容分发，也欢迎大家骂醒我。",
    topics: ["创业", "自由职业", "内容创作"],
    coverImageUrl: image("indie hacker coding in cafe at night with warm lamp light, realistic cinematic photo"),
  },
  {
    authorEmail: "lin@coffeechat.demo",
    title: "发现一个很有用的 Coffee Chat 开场方式",
    content: "与其一上来问“你平时都在做什么”，我最近更喜欢问“你最近最投入的一件事是什么”。这个问题几乎总能让对话更快进入真实状态，也更容易找到共鸣点。",
    topics: ["个人成长", "职业发展"],
  },
  {
    authorEmail: "chen@coffeechat.demo",
    title: "给第一次约投资人咖啡聊的创业者一个建议：别急着讲估值",
    content: "很多时候，一次轻量交流的目标不是拿到 term sheet，而是确认你面对的到底是怎样的投资人。把故事讲清楚，把当下最关键的问题摆出来，往往更容易进入下一次正式沟通。",
    topics: ["投资", "创业"],
  },
  {
    authorEmail: "song@coffeechat.demo",
    title: "海外内容增长最容易犯的错误：只翻译，不本地化",
    content: "翻译只是起点，不是终点。不同市场对同一个价值点的感知方式可能完全不同。最近在做北美和东南亚两套内容策略，对比下来最大的感受是：本地洞察必须来自真实对话。",
    topics: ["出海", "内容创作", "品牌营销"],
  },
  {
    authorEmail: "zhou@coffeechat.demo",
    title: "想做跨职能合作，先别急着上更多协同工具",
    content: "工具不是万能的。要先让团队对指标、目标和优先级有共同语言，协同工具才真正有价值。最近在做一个数据看板项目，最大的收获反而是对齐了团队的讨论框架。",
    topics: ["数据分析", "产品经理", "互联网"],
  },
];

async function main() {
  await prisma.comment.deleteMany();
  await prisma.postFavorite.deleteMany();
  await prisma.postLike.deleteMany();
  await prisma.postTopic.deleteMany();
  await prisma.post.deleteMany();
  await prisma.coffeeRequest.deleteMany();
  await prisma.favoriteUser.deleteMany();
  await prisma.userTopic.deleteMany();
  await prisma.profile.deleteMany();
  await prisma.user.deleteMany();
  await prisma.topic.deleteMany();

  const passwordHash = hashSync("demo123456", 10);

  const topics = new Map<string, { id: string; name: string }>();
  for (const name of topicNames) {
    const topic = await prisma.topic.create({ data: { name } });
    topics.set(name, topic);
  }

  const userMap = new Map<string, { id: string; profileId: string; name: string }>();
  for (const entry of users) {
    const user = await prisma.user.create({
      data: {
        email: entry.email,
        name: entry.name,
        passwordHash,
        profile: {
          create: {
            city: entry.city,
            organization: entry.organization,
            role: entry.role,
            roleType: entry.roleType,
            yearsOfExperience: entry.yearsOfExperience,
            bio: entry.bio,
            background: entry.background,
            peopleToMeet: entry.peopleToMeet,
            communicationPreference: entry.communicationPreference,
            languages: entry.languages,
            isOpenToCoffeeChat: entry.isOpenToCoffeeChat,
          },
        },
      },
      include: {
        profile: true,
      },
    });

    userMap.set(entry.email, { id: user.id, profileId: user.profile!.id, name: user.name });

    for (const topic of entry.offerTopics) {
      await prisma.userTopic.create({
        data: {
          profileId: user.profile!.id,
          topicId: topics.get(topic)!.id,
          purpose: UserTopicPurpose.OFFER,
        },
      });
    }

    for (const topic of entry.interestTopics) {
      await prisma.userTopic.create({
        data: {
          profileId: user.profile!.id,
          topicId: topics.get(topic)!.id,
          purpose: UserTopicPurpose.INTEREST,
        },
      });
    }
  }

  const favoritePairs = [
    ["lin@coffeechat.demo", "chen@coffeechat.demo"],
    ["lin@coffeechat.demo", "xu@coffeechat.demo"],
    ["chen@coffeechat.demo", "lin@coffeechat.demo"],
    ["song@coffeechat.demo", "ye@coffeechat.demo"],
  ];

  for (const [userEmail, favoriteEmail] of favoritePairs) {
    await prisma.favoriteUser.create({
      data: {
        userId: userMap.get(userEmail)!.id,
        favoriteUserId: userMap.get(favoriteEmail)!.id,
      },
    });
  }

  const postMap = new Map<string, string>();
  for (let index = 0; index < posts.length; index += 1) {
    const entry = posts[index];
    const post = await prisma.post.create({
      data: {
        authorId: userMap.get(entry.authorEmail)!.id,
        title: entry.title,
        content: entry.content,
        coverImageUrl: entry.coverImageUrl,
        createdAt: subHours(new Date(), posts.length - index),
        topics: {
          create: entry.topics.map((name) => ({
            topicId: topics.get(name)!.id,
          })),
        },
      },
    });

    postMap.set(entry.title, post.id);
  }

  const likes = [
    ["第一次把 AI 助手真正落到团队工作流里，我学到的 3 件事", "chen@coffeechat.demo"],
    ["第一次把 AI 助手真正落到团队工作流里，我学到的 3 件事", "song@coffeechat.demo"],
    ["最近看早期项目，最打动我的反而不是 pitch deck", "lin@coffeechat.demo"],
    ["自由职业一年后，我开始更重视稳定节奏而不是更高单价", "gu@coffeechat.demo"],
    ["设计负责人最容易忽略的，其实是团队情绪设计", "xu@coffeechat.demo"],
    ["一个独立开发者最近的困惑：是继续打磨产品，还是先做分发", "lin@coffeechat.demo"],
    ["一个独立开发者最近的困惑：是继续打磨产品，还是先做分发", "zhou@coffeechat.demo"],
    ["海外内容增长最容易犯的错误：只翻译，不本地化", "chen@coffeechat.demo"],
  ];

  for (const [title, email] of likes) {
    await prisma.postLike.create({
      data: {
        postId: postMap.get(title)!,
        userId: userMap.get(email)!.id,
      },
    });
  }

  const postFavorites = [
    ["第一次把 AI 助手真正落到团队工作流里，我学到的 3 件事", "zhou@coffeechat.demo"],
    ["自由职业一年后，我开始更重视稳定节奏而不是更高单价", "lin@coffeechat.demo"],
    ["一个独立开发者最近的困惑：是继续打磨产品，还是先做分发", "song@coffeechat.demo"],
    ["想做跨职能合作，先别急着上更多协同工具", "chen@coffeechat.demo"],
  ];

  for (const [title, email] of postFavorites) {
    await prisma.postFavorite.create({
      data: {
        postId: postMap.get(title)!,
        userId: userMap.get(email)!.id,
      },
    });
  }

  const comments = [
    {
      title: "第一次把 AI 助手真正落到团队工作流里，我学到的 3 件事",
      email: "tang@coffeechat.demo",
      content: "很认同“流程有没有被接住”这句话。研究工具真正落地时，往往也是卡在这个地方。",
    },
    {
      title: "最近看早期项目，最打动我的反而不是 pitch deck",
      email: "gu@coffeechat.demo",
      content: "被说中了，我最近就在反省自己是不是太沉迷于打磨 deck，而没有更早去找用户。",
    },
    {
      title: "自由职业一年后，我开始更重视稳定节奏而不是更高单价",
      email: "ye@coffeechat.demo",
      content: "稳定节奏真的太重要了，尤其是一个人工作的时候。想约你聊聊怎么设计自己的服务流程。",
    },
    {
      title: "一个独立开发者最近的困惑：是继续打磨产品，还是先做分发",
      email: "lin@coffeechat.demo",
      content: "欢迎下次我们线下碰一下，我最近也在和团队讨论“先做分发还是先补功能”。",
    },
    {
      title: "海外内容增长最容易犯的错误：只翻译，不本地化",
      email: "xu@coffeechat.demo",
      content: "内容团队常常最难的就是说服大家“本地化不是文案润色”，这条我收藏了。",
    },
    {
      title: "想做跨职能合作，先别急着上更多协同工具",
      email: "chen@coffeechat.demo",
      content: "太真实了。工具经常只是把混乱放大，前提还是要先对齐问题定义。",
    },
  ];

  for (let index = 0; index < comments.length; index += 1) {
    const entry = comments[index];
    await prisma.comment.create({
      data: {
        postId: postMap.get(entry.title)!,
        authorId: userMap.get(entry.email)!.id,
        content: entry.content,
        createdAt: subDays(new Date(), comments.length - index),
      },
    });
  }

  const requestEntries = [
    {
      sender: "lin@coffeechat.demo",
      receiver: "chen@coffeechat.demo",
      subject: "想聊聊 AI 产品在早期融资中的故事讲法",
      preferredDate: "2026-09-15",
      timeSlot: "周二晚上 19:30 - 20:30",
      meetingStyle: CommunicationPreference.OFFLINE,
      location: "北京·三里屯附近咖啡馆",
      discussionTopics: "想请教你怎么看 AI 应用在投资人视角下的差异化，以及 PM 在融资材料里怎么讲用户价值。",
      notes: "我会提前整理 2 个真实案例，控制在 45 分钟左右。",
      status: CoffeeRequestStatus.PENDING,
    },
    {
      sender: "song@coffeechat.demo",
      receiver: "xu@coffeechat.demo",
      subject: "一起聊聊内容团队如何支持出海增长",
      preferredDate: "2026-09-17",
      timeSlot: "周四下午 15:00 - 16:00",
      meetingStyle: CommunicationPreference.ONLINE,
      location: "腾讯会议",
      discussionTopics: "想交流不同市场下的品牌内容策略，以及 B2B 产品如何建立长期内容资产。",
      notes: "如果方便的话，也想听听你做自由顾问后的客户筛选方法。",
      status: CoffeeRequestStatus.PENDING,
    },
    {
      sender: "gu@coffeechat.demo",
      receiver: "lin@coffeechat.demo",
      subject: "请教独立开发者如何和产品团队合作验证需求",
      preferredDate: "2026-09-10",
      timeSlot: "周三晚上 20:00 - 21:00",
      meetingStyle: CommunicationPreference.BOTH,
      location: "上海·徐汇滨江 / 也可线上",
      discussionTopics: "我在做创作者工具，想聊聊需求验证和早期用户访谈的节奏。",
      notes: "会提前发一页产品介绍，方便快速进入正题。",
      status: CoffeeRequestStatus.ACCEPTED,
    },
    {
      sender: "zhou@coffeechat.demo",
      receiver: "ye@coffeechat.demo",
      subject: "想约你聊数据团队如何更好地和设计协作",
      preferredDate: "2026-09-08",
      timeSlot: "周一午休 12:30 - 13:15",
      meetingStyle: CommunicationPreference.ONLINE,
      location: "飞书会议",
      discussionTopics: "我们最近在推进新的分析看板，希望从设计视角看看信息结构和可解释性。",
      notes: "如果你时间紧，半小时也可以。",
      status: CoffeeRequestStatus.REJECTED,
    },
  ];

  for (const entry of requestEntries) {
    await prisma.coffeeRequest.create({
      data: {
        senderId: userMap.get(entry.sender)!.id,
        receiverId: userMap.get(entry.receiver)!.id,
        subject: entry.subject,
        preferredDate: entry.preferredDate,
        timeSlot: entry.timeSlot,
        meetingStyle: entry.meetingStyle,
        location: entry.location,
        discussionTopics: entry.discussionTopics,
        notes: entry.notes,
        status: entry.status,
      },
    });
  }

  console.log("Seeded CoffeeChat demo data.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

import { CommunicationPreference, ExperienceLevel, PrismaClient, RoleType, UserTopicPurpose } from "@prisma/client";
import { hashSync } from "bcryptjs";

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

const newUsers = [
  {
    name: "陆知行",
    email: "lu@coffeechat.demo",
    city: "上海",
    organization: "星桥智能",
    role: "AI 工程师",
    roleType: RoleType.ENGINEERING,
    yearsOfExperience: ExperienceLevel.MID,
    bio: "专注多模态产品和工程化落地，喜欢把复杂模型拆成可验证的小步骤。",
    background: "曾在自动驾驶公司做感知算法，现在负责 AI 应用的后端与评测，也经常和产品团队一起拆需求。",
    peopleToMeet: "想认识正在做 AI 产品、开发者工具和垂直行业应用的人。",
    communicationPreference: CommunicationPreference.BOTH,
    languages: "中文, English",
    isOpenToCoffeeChat: true,
    offerTopics: ["人工智能", "互联网", "创业"],
    interestTopics: ["产品经理", "数据分析", "学术研究"],
  },
  {
    name: "温言",
    email: "wen@coffeechat.demo",
    city: "北京",
    organization: "北岸教育",
    role: "教育产品负责人",
    roleType: RoleType.PRODUCT,
    yearsOfExperience: ExperienceLevel.LEAD,
    bio: "相信好的学习产品应该把目标拆细，而不是把内容堆得更多。",
    background: "做过教研、课程设计和 C 端产品，目前负责一个面向成人的 AI 学习产品。",
    peopleToMeet: "想认识关注教育科技、学习科学、内容产品和用户研究的人。",
    communicationPreference: CommunicationPreference.ONLINE,
    languages: "中文, English",
    isOpenToCoffeeChat: true,
    offerTopics: ["产品经理", "学术研究", "个人成长", "人工智能"],
    interestTopics: ["内容创作", "设计", "职业发展"],
  },
  {
    name: "沈清野",
    email: "shen@coffeechat.demo",
    city: "杭州",
    organization: "观澜资本",
    role: "早期投资人",
    roleType: RoleType.INVESTOR,
    yearsOfExperience: ExperienceLevel.SENIOR,
    bio: "主要看企业服务和 AI 应用，偏好能清晰讲出用户变化的团队。",
    background: "之前在产业集团做战略投资，现在在一家早期基金负责 SaaS 和 AI 方向。",
    peopleToMeet: "想认识一线创业者、独立开发者和正在从技术转商业的人。",
    communicationPreference: CommunicationPreference.BOTH,
    languages: "中文, English",
    isOpenToCoffeeChat: true,
    offerTopics: ["投资", "创业", "人工智能", "出海"],
    interestTopics: ["产品经理", "互联网", "数据分析"],
  },
  {
    name: "程嘉木",
    email: "cheng@coffeechat.demo",
    city: "深圳",
    organization: "独立顾问",
    role: "组织发展顾问",
    roleType: RoleType.FREELANCER,
    yearsOfExperience: ExperienceLevel.LEAD,
    bio: "帮助创业团队把战略讲清楚，也陪管理者处理组织扩大的摩擦。",
    background: "做过人力资源和组织发展，服务过消费品牌、SaaS 和硬件团队。",
    peopleToMeet: "想认识创始人、管理者、HRBP 和正在搭建早期团队的人。",
    communicationPreference: CommunicationPreference.OFFLINE,
    languages: "中文",
    isOpenToCoffeeChat: true,
    offerTopics: ["职业发展", "创业", "个人成长"],
    interestTopics: ["品牌营销", "互联网", "自由职业"],
  },
  {
    name: "贺书宁",
    email: "he@coffeechat.demo",
    city: "南京",
    organization: "南星科技",
    role: "前端工程师",
    roleType: RoleType.ENGINEERING,
    yearsOfExperience: ExperienceLevel.EARLY,
    bio: "关注产品体验和工程效率，最近在折腾 AI 辅助开发工作流。",
    background: "毕业两年，做过电商和 B 端后台，喜欢把交互细节做得顺手。",
    peopleToMeet: "想认识资深前端、产品设计师和做开发者工具的人。",
    communicationPreference: CommunicationPreference.BOTH,
    languages: "中文, English",
    isOpenToCoffeeChat: true,
    offerTopics: ["互联网", "人工智能", "设计"],
    interestTopics: ["产品经理", "个人成长", "内容创作"],
  },
  {
    name: "白露",
    email: "bai@coffeechat.demo",
    city: "上海",
    organization: "自由创作",
    role: "人文内容创作者",
    roleType: RoleType.CREATOR,
    yearsOfExperience: ExperienceLevel.MID,
    bio: "写城市、职业和个体叙事，也会做一些线下小型对话活动。",
    background: "做过媒体记者，后来做独立 newsletter 和播客，关注普通人的选择与处境。",
    peopleToMeet: "想认识创作者、研究者、品牌人和愿意认真聊聊生活的人。",
    communicationPreference: CommunicationPreference.OFFLINE,
    languages: "中文",
    isOpenToCoffeeChat: true,
    offerTopics: ["内容创作", "个人成长", "品牌营销"],
    interestTopics: ["学术研究", "设计", "自由职业"],
  },
  {
    name: "秦朗",
    email: "qin@coffeechat.demo",
    city: "成都",
    organization: "云帆出海",
    role: "海外运营负责人",
    roleType: RoleType.OPERATIONS,
    yearsOfExperience: ExperienceLevel.SENIOR,
    bio: "做过东南亚和拉美市场，喜欢用本地化运营解决冷启动问题。",
    background: "在跨境电商和内容平台做过增长，现在负责一个出海工具产品的海外运营。",
    peopleToMeet: "想认识做增长、支付、本地化、品牌和海外团队管理的人。",
    communicationPreference: CommunicationPreference.BOTH,
    languages: "中文, English",
    isOpenToCoffeeChat: true,
    offerTopics: ["出海", "互联网", "数据分析", "品牌营销"],
    interestTopics: ["创业", "内容创作", "人工智能"],
  },
  {
    name: "江屿",
    email: "jiang@coffeechat.demo",
    city: "武汉",
    organization: "个人项目",
    role: "开源项目维护者",
    roleType: RoleType.CREATOR,
    yearsOfExperience: ExperienceLevel.MID,
    bio: "维护一个面向创作者的开源工具，关注长期维护和社区协作。",
    background: "曾经在开发者工具公司做后端，现在用业余时间维护开源项目并组织本地开发者活动。",
    peopleToMeet: "想认识开源维护者、独立开发者和内容创作者。",
    communicationPreference: CommunicationPreference.ONLINE,
    languages: "中文, English",
    isOpenToCoffeeChat: true,
    offerTopics: ["互联网", "创业", "自由职业", "内容创作"],
    interestTopics: ["人工智能", "数据分析", "学术研究"],
  },
  {
    name: "苏黎",
    email: "su@coffeechat.demo",
    city: "广州",
    organization: "子夜设计",
    role: "品牌设计师",
    roleType: RoleType.DESIGN,
    yearsOfExperience: ExperienceLevel.EARLY,
    bio: "喜欢研究线下空间与品牌视觉，希望设计能帮品牌形成更稳定的记忆。",
    background: "从视觉传达毕业，做过消费品牌和新零售空间项目。",
    peopleToMeet: "想认识品牌操盘手、空间设计、内容和创业者。",
    communicationPreference: CommunicationPreference.BOTH,
    languages: "中文",
    isOpenToCoffeeChat: false,
    offerTopics: ["设计", "品牌营销", "内容创作"],
    interestTopics: ["创业", "个人成长", "学术研究"],
  },
  {
    name: "夏南",
    email: "xia@coffeechat.demo",
    city: "北京",
    organization: "未来实验室",
    role: "AI 研究员",
    roleType: RoleType.RESEARCH,
    yearsOfExperience: ExperienceLevel.MID,
    bio: "研究方向是模型评估和人类反馈，也在尝试把研究结果做成可用的评测工具。",
    background: "博士毕业后进入工业实验室，最近负责 LLM 安全与可靠性评估。",
    peopleToMeet: "想认识做 AI 产品、算法工程和负责任 AI 的人。",
    communicationPreference: CommunicationPreference.BOTH,
    languages: "中文, English",
    isOpenToCoffeeChat: true,
    offerTopics: ["人工智能", "学术研究", "数据分析"],
    interestTopics: ["产品经理", "创业", "职业发展"],
  },
  {
    name: "韩叙",
    email: "han@coffeechat.demo",
    city: "深圳",
    organization: "极客工坊",
    role: "硬件产品经理",
    roleType: RoleType.PRODUCT,
    yearsOfExperience: ExperienceLevel.SENIOR,
    bio: "做过智能硬件从概念到量产，擅长在体验和供应链之间找平衡。",
    background: "在消费电子公司做过多个硬件产品，也负责过海外众筹和渠道上线。",
    peopleToMeet: "想认识工业设计、供应链、跨境电商和 AI 硬件方向的人。",
    communicationPreference: CommunicationPreference.OFFLINE,
    languages: "中文, English",
    isOpenToCoffeeChat: true,
    offerTopics: ["产品经理", "创业", "出海", "设计"],
    interestTopics: ["人工智能", "投资", "互联网"],
  },
  {
    name: "许南乔",
    email: "nq@coffeechat.demo",
    city: "上海",
    organization: "见山咨询",
    role: "用户研究顾问",
    roleType: RoleType.RESEARCH,
    yearsOfExperience: ExperienceLevel.LEAD,
    bio: "用访谈和田野研究帮产品团队理解用户，也关注研究结果怎么变成决策。",
    background: "做过互联网大厂用户研究，也服务过早期创业团队和新消费品牌。",
    peopleToMeet: "想认识产品经理、设计师、创业者和做社会创新的人。",
    communicationPreference: CommunicationPreference.BOTH,
    languages: "中文, English",
    isOpenToCoffeeChat: true,
    offerTopics: ["学术研究", "产品经理", "品牌营销", "个人成长"],
    interestTopics: ["设计", "内容创作", "创业"],
  },
];

async function main() {
  const topics = new Map<string, { id: string; name: string }>();

  for (const name of topicNames) {
    const topic = await prisma.topic.upsert({
      where: { name },
      update: {},
      create: { name },
    });
    topics.set(name, topic);
  }

  const passwordHash = hashSync("demo123456", 10);
  let added = 0;

  for (const entry of newUsers) {
    const existing = await prisma.user.findUnique({ where: { email: entry.email } });
    if (existing) continue;

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
      include: { profile: true },
    });

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

    added += 1;
  }

  console.log(`Added ${added} users.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

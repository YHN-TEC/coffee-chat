import { CommunicationPreference, ExperienceLevel, RoleType } from "@prisma/client";

export const presetTopics = [
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

export const demoAccounts = [
  {
    label: "产品经理视角",
    email: "lin@coffeechat.demo",
    password: "demo123456",
    name: "林知夏",
  },
  {
    label: "投资人视角",
    email: "chen@coffeechat.demo",
    password: "demo123456",
    name: "陈牧远",
  },
];

export const roleTypeOptions = Object.values(RoleType);
export const experienceOptions = Object.values(ExperienceLevel);
export const communicationOptions = Object.values(CommunicationPreference);

export const cityOptions = ["上海", "北京", "杭州", "深圳", "成都", "广州", "苏州"];

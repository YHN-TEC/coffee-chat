import { CommunicationPreference, ExperienceLevel, RoleType } from "@prisma/client";
import { z } from "zod";

const tagsSchema = z.array(z.string().trim().min(1)).min(1, "请至少选择一个标签");

export const loginSchema = z.object({
  email: z.email("请输入有效邮箱"),
  password: z.string().min(6, "密码至少 6 位"),
});

export const registerSchema = loginSchema
  .extend({
    name: z.string().trim().min(2, "昵称至少 2 个字").max(24, "昵称最多 24 个字"),
    confirmPassword: z.string().min(6, "请再次输入密码"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "两次输入的密码不一致",
  });

export const profileSchema = z.object({
  avatarUrl: z.union([z.url("请输入有效图片地址"), z.literal("")]).optional(),
  name: z.string().trim().min(2, "请填写昵称"),
  city: z.string().trim().min(1, "请填写城市"),
  organization: z.string().trim().min(1, "请填写公司或学校"),
  role: z.string().trim().min(1, "请填写职位或身份"),
  roleType: z.enum(RoleType),
  yearsOfExperience: z.enum(ExperienceLevel),
  bio: z.string().trim().min(12, "简介至少 12 个字").max(120, "简介最多 120 个字"),
  background: z.string().trim().min(20, "背景经历至少 20 个字"),
  peopleToMeet: z.string().trim().min(8, "请描述你想认识的人"),
  communicationPreference: z.enum(CommunicationPreference),
  languages: z.string().trim().min(2, "请填写常用语言"),
  isOpenToCoffeeChat: z.boolean(),
  offerTopics: tagsSchema,
  interestTopics: tagsSchema,
});

export const coffeeRequestSchema = z.object({
  receiverId: z.string().trim().min(1),
  subject: z.string().trim().min(4, "请填写邀约主题").max(60, "主题最多 60 个字"),
  preferredDate: z.string().trim().min(1, "请选择期望日期"),
  timeSlot: z.string().trim().min(4, "请填写期望时间段"),
  meetingStyle: z.enum(CommunicationPreference),
  location: z.string().trim().min(4, "请填写地点或线上方式"),
  discussionTopics: z.string().trim().min(12, "请补充想聊的内容"),
  notes: z.string().trim().min(6, "请填写对方需要提前了解的信息"),
});

export const aiRequestSchema = coffeeRequestSchema.extend({
  source: z.string().trim().optional(),
  aiSessionId: z.string().trim().optional(),
});

export const aiMatchSchema = z.object({
  background: z.string().trim().min(10, "请至少用 10 个字介绍你的背景"),
  goal: z.string().trim().min(10, "请至少用 10 个字描述交流目标"),
  preferredDate: z.string().trim().min(1, "请选择期望日期"),
  timeSlot: z.string().trim().min(4, "请填写期望时间段"),
  meetingStyle: z.enum(CommunicationPreference),
});

export const postSchema = z.object({
  title: z.string().trim().min(6, "标题至少 6 个字").max(60, "标题最多 60 个字"),
  content: z.string().trim().min(30, "正文至少 30 个字").max(1000, "正文最多 1000 个字"),
  coverImageUrl: z.union([z.url("请输入有效图片地址"), z.literal("")]).optional(),
  topics: tagsSchema,
});

export const commentSchema = z.object({
  content: z.string().trim().min(2, "评论至少 2 个字").max(300, "评论最多 300 个字"),
});

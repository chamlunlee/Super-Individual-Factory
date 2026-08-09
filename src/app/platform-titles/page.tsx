import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { PlatformAdaptForm } from "@/components/PlatformAdaptForm";
import {
  COMMENT_COMMON_RULES,
  METRIC_FUNNEL,
  PLATFORM_COMMENT_PLAYBOOKS,
  PLATFORM_METRIC_GUIDES,
  PRESET_METRIC_FOCUS,
} from "@/lib/model/platform-metrics";
import {
  CROSS_PLATFORM_REWRITE,
  PLATFORM_COMPARE_MATRIX,
  PLATFORM_TITLE_GUIDES,
} from "@/lib/model/platform-titles";

export default function PlatformTitlesPage() {
  return (
    <div className="pt-6">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 flex-1">
          <p className="text-sm tracking-widest text-accent">PLATFORM GUIDE</p>
          <h1 className="mt-2 font-display text-3xl md:text-5xl">平台取向</h1>
          <p className="mt-3 max-w-2xl text-ink/65 leading-relaxed">
            先判这一条发哪、冲什么指标，再拿到可粘贴发物料并一键进工作室。方法论收入下方「查阅」，不必先读完整页才能行动。
          </p>
        </div>

        <aside className="w-full shrink-0 lg:w-[220px]">
          <div className="rounded-2xl border border-accent/25 bg-white/80 p-4 shadow-sm ring-1 ring-moss/10 backdrop-blur">
            <p className="text-xs tracking-widest text-accent">微信咨询</p>
            <p className="mt-1 font-display text-lg text-ink">我是一条鱼</p>
            <p className="mt-1 text-xs leading-relaxed text-ink/55">
              扫码加好友，聊分发与内容获客
            </p>
            <p className="mt-1.5 text-xs font-medium text-moss">
              添加好友备注【自媒体】
            </p>
            <div className="mt-3 overflow-hidden rounded-xl bg-paper/80 p-2 ring-1 ring-ink/10">
              <Image
                src="/wechat-qr.png"
                alt="微信二维码：我是一条鱼"
                width={360}
                height={420}
                className="mx-auto h-auto w-full max-w-[180px] object-contain"
                priority
              />
            </div>
            <p className="mt-2 text-center text-[11px] text-ink/45">
              扫二维码，添加我为朋友
            </p>
          </div>
        </aside>
      </div>

      <PlatformAdaptForm />

      <details className="mt-12 rounded-2xl border border-ink/10 bg-white/50 p-4 md:p-5">
        <summary className="cursor-pointer font-display text-xl text-ink md:text-2xl">
          查阅：取向 / 指标 / 评论参考
        </summary>
        <p className="mt-2 text-sm text-ink/55">
          百科与对照表默认折叠。需要深挖平台差异时再展开。
        </p>

      <section className="mt-8 overflow-x-auto rounded-2xl border border-ink/10 bg-white/70">
        <table className="min-w-[720px] w-full text-left text-sm">
          <thead className="border-b border-ink/10 bg-sand/50 text-ink/70">
            <tr>
              <th className="px-4 py-3 font-medium">维度</th>
              <th className="px-4 py-3 font-medium">小红书</th>
              <th className="px-4 py-3 font-medium">视频号</th>
              <th className="px-4 py-3 font-medium">B站</th>
              <th className="px-4 py-3 font-medium">抖音</th>
            </tr>
          </thead>
          <tbody>
            {PLATFORM_COMPARE_MATRIX.map((row) => (
              <tr key={row.dim} className="border-b border-ink/5 last:border-0">
                <td className="px-4 py-3 font-medium text-moss">{row.dim}</td>
                <td className="px-4 py-3 text-ink/75">{row.xiaohongshu}</td>
                <td className="px-4 py-3 text-ink/75">{row.shipinhao}</td>
                <td className="px-4 py-3 text-ink/75">{row.bilibili}</td>
                <td className="px-4 py-3 text-ink/75">{row.douyin}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="mt-12">
        <h2 className="font-display text-2xl md:text-3xl">指标上升触点</h2>
        <p className="mt-2 max-w-3xl text-sm text-ink/65 leading-relaxed">
          不做「点赞到多少就涨粉」的伪精确数字。下表是方向参考：想拉高某指标，内容必须碰到的用户心理点。
          通用漏斗：{METRIC_FUNNEL}。一人工作室只盯本平台主指标。
        </p>

        <div className="mt-6 space-y-5">
          {PLATFORM_METRIC_GUIDES.map((guide) => (
            <article
              key={guide.id}
              className="rounded-2xl border border-ink/10 bg-white/70 p-5 md:p-6"
            >
              <div className="flex flex-wrap items-end justify-between gap-3">
                <div>
                  <h3 className="font-display text-xl md:text-2xl">
                    {guide.name}
                  </h3>
                  <p className="mt-1 text-sm text-moss">
                    主指标：{guide.primaryMetric}
                  </p>
                </div>
                <p className="text-sm text-ink/55">
                  上升顺序：{guide.riseOrder}
                </p>
              </div>
              <p className="mt-2 text-sm text-ink/65">{guide.funnelNote}</p>

              <div className="mt-4 overflow-x-auto rounded-xl border border-ink/10">
                <table className="min-w-[640px] w-full text-left text-sm">
                  <thead className="bg-sand/50 text-ink/60">
                    <tr>
                      <th className="px-3 py-2 font-medium">指标</th>
                      <th className="px-3 py-2 font-medium">用户心里</th>
                      <th className="px-3 py-2 font-medium">内容触点</th>
                      <th className="px-3 py-2 font-medium">创作检查</th>
                    </tr>
                  </thead>
                  <tbody>
                    {guide.touchpoints.map((row) => (
                      <tr
                        key={`${guide.id}-${row.metric}-${row.label}`}
                        className="border-t border-ink/5 align-top"
                      >
                        <td className="px-3 py-2.5 font-medium text-ink">
                          {row.label}
                        </td>
                        <td className="px-3 py-2.5 text-ink/70">
                          「{row.userMind}」
                        </td>
                        <td className="px-3 py-2.5 text-ink/70">
                          {row.contentHit}
                        </td>
                        <td className="px-3 py-2.5 text-ink/55">
                          {row.checklist}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-6 rounded-2xl border border-moss/20 bg-moss/5 p-5">
          <h3 className="font-display text-xl">片型 × 本条主攻</h3>
          <p className="mt-1 text-sm text-ink/60">
            发布步手填数据时，优先填主指标（小红书填藏与线索，抖音填播放/赞，视频号看是否转发），避免五格平均用力。
          </p>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            {PRESET_METRIC_FOCUS.map((row) => (
              <div
                key={row.presetId}
                className="rounded-xl border border-ink/10 bg-white/80 px-4 py-3"
              >
                <p className="font-medium text-ink">{row.presetLabel}</p>
                <p className="mt-1 text-xs text-moss">{row.platforms}</p>
                <p className="mt-2 text-sm text-ink/70">主攻：{row.focus}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mt-12">
        <h2 className="font-display text-2xl md:text-3xl">更好的评论数据</h2>
        <p className="mt-2 max-w-3xl text-sm text-ink/65 leading-relaxed">
          「好评论」不是表情刷屏，而是可讨论、可站队、可补充——能延长停留，也能变成下一条选题与私信线索。
        </p>

        <div className="mt-5 rounded-2xl border border-ink/10 bg-white/70 p-5">
          <h3 className="font-display text-xl">跨平台共性</h3>
          <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm text-ink/70">
            {COMMENT_COMMON_RULES.map((rule) => (
              <li key={rule}>{rule}</li>
            ))}
          </ul>
        </div>

        <div className="mt-6 space-y-4">
          {PLATFORM_COMMENT_PLAYBOOKS.map((pb) => (
            <article
              key={pb.id}
              className="rounded-2xl border border-ink/10 bg-white/70 p-5 md:p-6"
            >
              <div className="flex flex-wrap items-end justify-between gap-2">
                <h3 className="font-display text-xl md:text-2xl">{pb.name}</h3>
                <p className="text-sm text-moss">{pb.commentShape}</p>
              </div>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <Block title="开评钩子（可套用）">
                  <ul className="list-disc space-y-1.5 pl-4">
                    {pb.hooks.map((h) => (
                      <li key={h}>{h}</li>
                    ))}
                  </ul>
                </Block>
                <Block title="结构手法">
                  <ul className="list-disc space-y-1.5 pl-4">
                    {pb.tactics.map((t) => (
                      <li key={t}>{t}</li>
                    ))}
                  </ul>
                </Block>
                <Block title="尽量避免">
                  <ul className="list-disc space-y-1.5 pl-4">
                    {pb.avoid.map((a) => (
                      <li key={a}>{a}</li>
                    ))}
                  </ul>
                </Block>
                <Block title="作者运营动作">
                  <ul className="list-disc space-y-1.5 pl-4">
                    {pb.authorMoves.map((m) => (
                      <li key={m}>{m}</li>
                    ))}
                  </ul>
                </Block>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="mt-12 space-y-6">
        {PLATFORM_TITLE_GUIDES.map((p, index) => (
          <article
            key={p.id}
            className="rounded-2xl border border-ink/10 bg-white/70 p-5 md:p-6 transition hover:border-accent/25"
            style={{ animationDelay: `${index * 60}ms` }}
          >
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="text-xs tracking-widest text-accent">0{index + 1}</p>
                <h2 className="font-display text-2xl md:text-3xl">{p.name}</h2>
                <p className="mt-1 text-sm text-moss">{p.vibe}</p>
              </div>
              <p className="max-w-md text-sm text-ink/60 md:text-right">{p.titleJob}</p>
            </div>

            <p className="mt-4 text-sm leading-relaxed text-ink/70">{p.userMindset}</p>

            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <Block title="标题取向">
                <ul className="list-disc space-y-1.5 pl-4">
                  {p.orientations.map((o) => (
                    <li key={o}>{o}</li>
                  ))}
                </ul>
              </Block>
              <Block title="常用公式">
                <ul className="list-disc space-y-1.5 pl-4">
                  {p.formula.map((o) => (
                    <li key={o}>{o}</li>
                  ))}
                </ul>
              </Block>
              <Block title="更合适">
                <ul className="list-disc space-y-1.5 pl-4">
                  {p.doList.map((o) => (
                    <li key={o}>{o}</li>
                  ))}
                </ul>
              </Block>
              <Block title="尽量避免">
                <ul className="list-disc space-y-1.5 pl-4">
                  {p.dontList.map((o) => (
                    <li key={o}>{o}</li>
                  ))}
                </ul>
              </Block>
            </div>

            <div className="mt-5 rounded-xl border border-moss/20 bg-moss/5 p-4">
              <h3 className="text-sm font-medium text-ink">关键词填写参考</h3>
              <p className="mt-1 text-xs text-ink/55">{p.keywordRefs.tip}</p>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                {p.keywordRefs.groups.map((group) => (
                  <div key={group.label}>
                    <p className="mb-1.5 text-xs font-medium text-moss">
                      {group.label}
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {group.words.map((word) => (
                        <span
                          key={word}
                          className="rounded-md bg-white/80 px-2 py-1 text-xs text-ink/75 ring-1 ring-ink/10"
                        >
                          {word}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-5 rounded-xl bg-sand/60 p-4">
              <h3 className="text-sm font-medium">示例标题</h3>
              <ul className="mt-2 space-y-2 text-sm text-ink/75">
                {p.examples.map((ex) => (
                  <li key={ex} className="border-l-2 border-accent/40 pl-3">
                    {ex}
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-4 grid gap-2 text-xs text-ink/55 md:grid-cols-2">
              <p>
                <span className="text-ink/80">题材：</span>
                {p.scoreBias.subject}
              </p>
              <p>
                <span className="text-ink/80">句式：</span>
                {p.scoreBias.sentencePattern}
              </p>
              <p>
                <span className="text-ink/80">用户感知：</span>
                {p.scoreBias.userPerception}
              </p>
              <p>
                <span className="text-ink/80">观点表达：</span>
                {p.scoreBias.viewpoint}
              </p>
            </div>
          </article>
        ))}
      </section>

      <section className="mt-12 rounded-2xl border border-ink/10 bg-white/70 p-5 md:p-6">
        <h2 className="font-display text-2xl">同一题材，多平台怎么改</h2>
        <p className="mt-2 text-sm text-ink/60">
          题材：{CROSS_PLATFORM_REWRITE.topic}。核心信息不变，改的是「标题要完成的工作」。
        </p>
        <div className="mt-5 grid gap-3">
          {CROSS_PLATFORM_REWRITE.rows.map((row) => (
            <div
              key={row.platform}
              className="grid gap-1 rounded-xl bg-paper/80 px-4 py-3 md:grid-cols-[88px_1fr]"
            >
              <p className="text-sm font-medium text-moss">{row.platform}</p>
              <div>
                <p className="text-sm text-ink">{row.title}</p>
                <p className="mt-1 text-xs text-ink/50">{row.why}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-10 flex flex-wrap gap-3 text-sm">
        <Link
          href="/title-radar"
          className="rounded-lg bg-ink px-4 py-2.5 text-white transition hover:bg-accent"
        >
          去标题雷达实战 →
        </Link>
        <Link
          href="/triple-line"
          className="rounded-lg border border-ink/15 bg-white/70 px-4 py-2.5 transition hover:border-accent/40"
        >
          回三点一线选题
        </Link>
        <Link
          href="/"
          className="rounded-lg border border-ink/15 bg-white/70 px-4 py-2.5 transition hover:border-accent/40"
        >
          回项目列表
        </Link>
      </section>
      </details>
    </div>
  );
}

function Block({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="rounded-xl border border-ink/5 bg-paper/50 p-4 text-sm text-ink/70">
      <h3 className="mb-2 font-medium text-ink">{title}</h3>
      {children}
    </div>
  );
}

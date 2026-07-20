"use client";

import { useState, Suspense, lazy } from "react";
import {
  ArrowRight,
  Bell,
  BookOpen,
  Bug,
  Check,
  ChevronDown,
  ExternalLink,
  Flame,
  Map as MapIcon,
  Megaphone,
  Scale,
  Skull,
  Sparkles,
  Sword,
  Ticket,
  Users,
  Wind,
  Zap,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import { useMessages } from "next-intl";
import { VideoFeature } from "@/components/home/VideoFeature";
import { LatestGuidesAccordion } from "@/components/home/LatestGuidesAccordion";
import { NativeBannerAd, AdBanner } from "@/components/ads";
import { getPreferredMobileBannerSelection } from "@/components/ads/mobileAdConfigs";
import { scrollToSection } from "@/lib/scrollToSection";
import { DynamicIcon } from "@/components/ui/DynamicIcon";
import type { ContentItemWithType } from "@/lib/getLatestArticles";

// Lazy load heavy components
const HeroStats = lazy(() => import("@/components/home/HeroStats"));
const FAQSection = lazy(() => import("@/components/home/FAQSection"));
const CTASection = lazy(() => import("@/components/home/CTASection"));

// Loading placeholder
const LoadingPlaceholder = ({ height = "h-64" }: { height?: string }) => (
  <div
    className={`${height} bg-white/5 border border-border rounded-xl animate-pulse`}
  />
);

// 模块标题（带主题图标）
function ModuleHeader({ icon: Icon, title }: { icon: LucideIcon; title: string }) {
  return (
    <div className="flex items-center justify-center gap-3 mb-3 md:mb-4">
      <Icon className="w-7 h-7 md:w-8 md:h-8 text-[hsl(var(--nav-theme-light))]" />
      <h2 className="text-3xl md:text-5xl font-bold">{title}</h2>
    </div>
  );
}

// Tools Grid 导航卡片 → section id 映射（与 8 个模块锚点一一对应）
const TOOLS_SECTION_IDS = [
  "demonfall-codes",
  "beginner-guide",
  "breathing-styles-tier-list",
  "races-guide",
  "maps-and-locations",
  "weapons-and-skills",
  "boss-guide",
  "updates-and-news",
];

// Weapons 模块每个卡片使用不同的图标
const WEAPON_ICONS = [Sword, Wind, Flame, Zap, Sparkles];
// Races 模块每个卡片使用不同的图标
const RACE_ICONS = [Users, Flame, Sparkles];
// Updates 模块每个卡片使用不同的图标
const UPDATE_ICONS = [Sparkles, Scale, Bug, Megaphone];

interface HomePageClientProps {
  latestArticles: ContentItemWithType[];
  locale: string;
}

export default function HomePageClient({
  latestArticles,
  locale,
}: HomePageClientProps) {
  const t = useMessages() as any;
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://demonfallwiki.wiki";

  // Structured data
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${siteUrl}/#website`,
        url: siteUrl,
        name: "Demonfall Wiki",
        description:
          "Demonfall Wiki covers codes, breathing styles, clans, weapons, maps, bosses, builds, and progression guides for Roblox Demonfall players.",
        image: {
          "@type": "ImageObject",
          url: `${siteUrl}/images/hero.webp`,
          width: 1280,
          height: 720,
          caption: "Demonfall - Roblox Anime Action RPG",
        },
        potentialAction: {
          "@type": "SearchAction",
          target: `${siteUrl}/search?q={search_term_string}`,
          "query-input": "required name=search_term_string",
        },
      },
      {
        "@type": "Organization",
        "@id": `${siteUrl}/#organization`,
        name: "Demonfall Wiki",
        alternateName: "Demonfall",
        url: siteUrl,
        description:
          "Demonfall Wiki resource hub covering codes, breathing styles, clans, weapons, maps, bosses, builds, and progression guides for Roblox Demonfall players",
        logo: {
          "@type": "ImageObject",
          url: `${siteUrl}/android-chrome-512x512.png`,
          width: 512,
          height: 512,
        },
        image: {
          "@type": "ImageObject",
          url: `${siteUrl}/images/hero.webp`,
          width: 1280,
          height: 720,
          caption: "Demonfall Wiki - Roblox Anime Action RPG",
        },
        sameAs: [
          "https://www.roblox.com/games/4855457388/Demonfall",
          "https://discord.com/invite/fireheart",
          "https://www.reddit.com/r/Demonfall",
        ],
      },
      {
        "@type": "VideoGame",
        name: "Demonfall",
        gamePlatform: ["PC", "Mac", "Mobile", "Roblox"],
        applicationCategory: "Game",
        genre: ["Action", "RPG", "Anime", "Fighting"],
        numberOfPlayers: {
          minValue: 1,
          maxValue: 12,
        },
        offers: {
          "@type": "Offer",
          priceCurrency: "USD",
          availability: "https://schema.org/InStock",
          url: "https://www.roblox.com/games/4855457388/Demonfall",
        },
      },
      {
        "@type": "VideoObject",
        name: "Demonfall Flame Breathing Showcase",
        description:
          "Demonfall Flame Breathing gameplay showcase featuring combat skills and breathing style abilities on Roblox.",
        uploadDate: "2026-07-21",
        thumbnailUrl: `${siteUrl}/images/hero.webp`,
        embedUrl: "https://www.youtube.com/embed/DZAcQ-nUBVU",
        url: "https://www.youtube.com/watch?v=DZAcQ-nUBVU",
      },
    ],
  };

  // Boss accordion 状态
  const [bossExpanded, setBossExpanded] = useState<number | null>(null);
  const mobileBannerAd = getPreferredMobileBannerSelection();

  return (
    <div className="home-shell min-h-screen bg-background text-foreground">
      {/* Structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      {/* 广告位 1: 顶部固定横幅 */}
      <div className="sticky top-20 z-20 border-b border-border py-2">
        <AdBanner type="banner-320x50" adKey={process.env.NEXT_PUBLIC_AD_MOBILE_320X50} />
      </div>

      {/* Hero Section */}
      <section className="relative overflow-hidden px-4 pt-24 pb-14 md:pt-32 md:pb-20">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-8 scroll-reveal">
            {/* Badge */}
            <div
              className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 md:px-4 md:py-2
                            bg-[hsl(var(--nav-theme)/0.1)]
                            border border-[hsl(var(--nav-theme)/0.3)] mb-4 md:mb-6"
            >
              <Sparkles className="w-4 h-4 text-[hsl(var(--nav-theme-light))]" />
              <span className="text-xs md:text-sm font-medium">
                {t.hero.badge}
              </span>
            </div>

            {/* Title */}
            <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold mb-4 md:mb-6 leading-[1.05]">
              {t.hero.title}
            </h1>

            {/* Description */}
            <p className="mx-auto mb-8 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg md:mb-10 md:max-w-3xl md:text-2xl">
              {t.hero.description}
            </p>

            {/* CTA Buttons */}
            <div className="mb-10 flex flex-col justify-center gap-3 sm:flex-row md:mb-12 md:gap-4">
              <button
                onClick={() => scrollToSection("demonfall-codes")}
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 md:px-8 md:py-4
                           bg-[hsl(var(--nav-theme))] hover:bg-[hsl(var(--nav-theme)/0.9)]
                           text-white rounded-lg font-semibold text-base md:text-lg transition-colors"
              >
                <Ticket className="w-5 h-5" />
                {t.hero.getFreeCodesCTA}
              </button>
              <a
                href="https://www.roblox.com/games/4855457388/Demonfall"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 md:px-8 md:py-4
                           border border-border hover:bg-white/10 rounded-lg
                           font-semibold text-base md:text-lg transition-colors"
              >
                {t.hero.playOnRobloxCTA}
                <ArrowRight className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Stats */}
          <Suspense fallback={<LoadingPlaceholder height="h-32" />}>
            <HeroStats stats={Object.values(t.hero.stats)} />
          </Suspense>
        </div>
      </section>

      {/* Video Section - 紧跟 Hero 之后（max-w-5xl，避免挤压广告空间） */}
      <section className="px-4 py-10 md:py-12">
        <div className="scroll-reveal container mx-auto max-w-5xl">
          <div className="relative overflow-hidden rounded-2xl">
            <VideoFeature
              videoId="DZAcQ-nUBVU"
              title="Demonfall Flame Breathing Showcase"
            />
          </div>
        </div>
      </section>

      {/* Tools Grid - 8 Navigation Cards（视频区之后、Latest Updates 之前） */}
      <section className="px-4 py-14 md:py-20 bg-white/[0.02]">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-8 md:mb-12 scroll-reveal">
            <h2 className="text-3xl md:text-5xl font-bold mb-3 md:mb-4">
              {t.tools.title}{" "}
              <span className="text-[hsl(var(--nav-theme-light))]">
                {t.tools.titleHighlight}
              </span>
            </h2>
            <p className="text-base md:text-lg text-muted-foreground">
              {t.tools.subtitle}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4 lg:grid-cols-4">
            {t.tools.cards.map((card: any, index: number) => {
              const sectionId = TOOLS_SECTION_IDS[index];
              return (
                <a
                  key={index}
                  href={`#${sectionId}`}
                  onClick={(e) => {
                    e.preventDefault();
                    scrollToSection(sectionId);
                  }}
                  className="scroll-reveal group rounded-xl border border-border p-4 md:p-6
                             bg-card hover:border-[hsl(var(--nav-theme)/0.5)]
                             transition-all duration-300 cursor-pointer text-left
                             hover:shadow-lg hover:shadow-[hsl(var(--nav-theme)/0.1)] block"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div
                    className="mb-3 h-10 w-10 rounded-lg md:mb-4 md:h-12 md:w-12
                                  bg-[hsl(var(--nav-theme)/0.1)]
                                  flex items-center justify-center
                                  group-hover:bg-[hsl(var(--nav-theme)/0.2)]
                                  transition-colors"
                  >
                    <DynamicIcon
                      name={card.icon}
                      className="h-5 w-5 md:h-6 md:w-6 text-[hsl(var(--nav-theme-light))]"
                    />
                  </div>
                  <h3 className="mb-1.5 text-sm md:text-base font-semibold">
                    {card.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {card.description}
                  </p>
                </a>
              );
            })}
          </div>
        </div>
      </section>

      {/* 广告位 2: 首屏内容之后再加载广告 */}
      <NativeBannerAd adKey={process.env.NEXT_PUBLIC_AD_NATIVE_BANNER || ""} />

      {/* 广告位 3: 移动端优先使用方形，桌面端保留横幅 */}
      <AdBanner
        type="banner-300x250"
        adKey={process.env.NEXT_PUBLIC_AD_BANNER_300X250}
        className="md:hidden"
      />
      <AdBanner
        type="banner-728x90"
        adKey={process.env.NEXT_PUBLIC_AD_BANNER_728X90}
        className="hidden md:flex"
      />

      {/* Module 1: Demonfall Codes */}
      <section id="demonfall-codes" className="scroll-mt-24 px-4 py-14 md:py-20">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-8 md:mb-12 scroll-reveal">
            <ModuleHeader icon={Ticket} title={t.modules.demonfallCodes.title} />
            <p className="text-base md:text-lg text-muted-foreground max-w-3xl mx-auto">
              {t.modules.demonfallCodes.intro}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 md:mb-8">
            {t.modules.demonfallCodes.codes.map((c: any, index: number) => (
              <div
                key={index}
                className="flex flex-col p-5 md:p-6 bg-white/5 border border-border rounded-xl
                           hover:border-[hsl(var(--nav-theme)/0.5)] transition-colors"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs px-2 py-1 rounded-full bg-[hsl(var(--nav-theme)/0.15)] border border-[hsl(var(--nav-theme)/0.4)] text-[hsl(var(--nav-theme-light))] font-semibold">
                    {c.status}
                  </span>
                  <Ticket className="w-5 h-5 text-[hsl(var(--nav-theme-light))]" />
                </div>
                <code className="text-xl md:text-2xl font-bold tracking-wide mb-2 text-[hsl(var(--nav-theme-light))]">
                  {c.code}
                </code>
                <p className="text-sm text-muted-foreground mb-4">{c.reward}</p>
                <div className="mt-auto">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                    How to redeem
                  </p>
                  <ol className="space-y-1.5">
                    {c.howToRedeem.map((step: string, si: number) => (
                      <li
                        key={si}
                        className="flex items-start gap-2 text-xs text-muted-foreground"
                      >
                        <span className="flex-shrink-0 w-4 h-4 rounded-full bg-[hsl(var(--nav-theme)/0.2)] text-[hsl(var(--nav-theme-light))] flex items-center justify-center text-[10px] font-bold mt-0.5">
                          {si + 1}
                        </span>
                        {step}
                      </li>
                    ))}
                  </ol>
                </div>
              </div>
            ))}
          </div>

          <div className="scroll-reveal p-4 md:p-5 bg-[hsl(var(--nav-theme)/0.05)] border border-[hsl(var(--nav-theme)/0.3)] rounded-xl text-center text-sm text-muted-foreground">
            {t.modules.demonfallCodes.quickTip}
          </div>
        </div>
      </section>

      {/* 广告位 4: 第一模块之后的阅读停顿位 */}
      <AdBanner
        type="banner-300x250"
        adKey={process.env.NEXT_PUBLIC_AD_BANNER_300X250}
        className="md:hidden"
      />
      <AdBanner
        type="banner-468x60"
        adKey={process.env.NEXT_PUBLIC_AD_BANNER_468X60}
        className="hidden md:flex"
      />

      {/* Module 2: Demonfall Beginner Guide */}
      <section
        id="beginner-guide"
        className="scroll-mt-24 px-4 py-14 md:py-20 bg-white/[0.02]"
      >
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-8 md:mb-12 scroll-reveal">
            <ModuleHeader icon={BookOpen} title={t.modules.demonfallBeginnerGuide.title} />
            <p className="text-base md:text-lg text-muted-foreground max-w-3xl mx-auto">
              {t.modules.demonfallBeginnerGuide.intro}
            </p>
          </div>

          <div className="scroll-reveal space-y-3 md:space-y-4 mb-8 md:mb-10">
            {t.modules.demonfallBeginnerGuide.steps.map(
              (step: any, index: number) => (
                <div
                  key={index}
                  className="flex gap-3 md:gap-4 p-4 md:p-6 bg-white/5 border border-border rounded-xl hover:border-[hsl(var(--nav-theme)/0.5)] transition-colors"
                >
                  <div className="flex h-10 w-10 md:h-12 md:w-12 flex-shrink-0 items-center justify-center rounded-full border-2 border-[hsl(var(--nav-theme)/0.5)] bg-[hsl(var(--nav-theme)/0.2)]">
                    <span className="text-base md:text-xl font-bold text-[hsl(var(--nav-theme-light))]">
                      {index + 1}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-lg md:text-xl font-bold mb-1.5 md:mb-2">
                      {step.title}
                    </h3>
                    <p className="text-sm md:text-base text-muted-foreground">
                      {step.description}
                    </p>
                  </div>
                </div>
              ),
            )}
          </div>

          <div className="scroll-reveal p-4 md:p-6 bg-[hsl(var(--nav-theme)/0.05)] border border-[hsl(var(--nav-theme)/0.3)] rounded-xl">
            <div className="flex items-center gap-2 mb-3 md:mb-4">
              <BookOpen className="w-5 h-5 text-[hsl(var(--nav-theme-light))]" />
              <h3 className="font-bold text-base md:text-lg">Quick Tips</h3>
            </div>
            <ul className="space-y-2">
              {t.modules.demonfallBeginnerGuide.quickTips.map(
                (tip: string, index: number) => (
                  <li key={index} className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-[hsl(var(--nav-theme-light))] mt-1 flex-shrink-0" />
                    <span className="text-muted-foreground text-sm">{tip}</span>
                  </li>
                ),
              )}
            </ul>
          </div>
        </div>
      </section>

      {/* Module 3: Demonfall Breathing Styles Tier List */}
      <section
        id="breathing-styles-tier-list"
        className="scroll-mt-24 px-4 py-14 md:py-20"
      >
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-8 md:mb-12 scroll-reveal">
            <ModuleHeader icon={Wind} title={t.modules.demonfallBreathingTierList.title} />
            <p className="text-base md:text-lg text-muted-foreground max-w-3xl mx-auto">
              {t.modules.demonfallBreathingTierList.intro}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {t.modules.demonfallBreathingTierList.tiers.map(
              (tier: any, index: number) => (
                <div
                  key={index}
                  className={`p-5 md:p-6 rounded-xl border ${
                    tier.tier === "S"
                      ? "bg-[hsl(var(--nav-theme)/0.1)] border-[hsl(var(--nav-theme)/0.4)]"
                      : "bg-white/5 border-border"
                  }`}
                >
                  <div className="flex items-center gap-3 mb-4">
                    <span
                      className={`flex items-center justify-center w-10 h-10 rounded-full text-lg font-bold ${
                        tier.tier === "S"
                          ? "bg-[hsl(var(--nav-theme))] text-white"
                          : "bg-[hsl(var(--nav-theme)/0.2)] text-[hsl(var(--nav-theme-light))]"
                      }`}
                    >
                      {tier.tier}
                    </span>
                    <p className="font-bold">{tier.label}</p>
                  </div>
                  <ul className="space-y-3">
                    {tier.styles.map((s: any, si: number) => (
                      <li key={si}>
                        <p className="font-semibold text-sm text-[hsl(var(--nav-theme-light))]">
                          {s.name}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {s.description}
                        </p>
                      </li>
                    ))}
                  </ul>
                </div>
              ),
            )}
          </div>
        </div>
      </section>

      {/* 广告位 5: 模块间横幅 */}
      <AdBanner
        type="banner-300x250"
        adKey={process.env.NEXT_PUBLIC_AD_BANNER_300X250}
        className="md:hidden"
      />
      <AdBanner
        type="banner-468x60"
        adKey={process.env.NEXT_PUBLIC_AD_BANNER_468X60}
        className="hidden md:flex"
      />

      {/* Module 4: Demonfall Races Guide */}
      <section
        id="races-guide"
        className="scroll-mt-24 px-4 py-14 md:py-20 bg-white/[0.02]"
      >
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-8 md:mb-12 scroll-reveal">
            <ModuleHeader icon={Users} title={t.modules.demonfallRacesGuide.title} />
            <p className="text-base md:text-lg text-muted-foreground max-w-3xl mx-auto">
              {t.modules.demonfallRacesGuide.intro}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {t.modules.demonfallRacesGuide.cards.map((card: any, index: number) => {
              const Icon = RACE_ICONS[index % RACE_ICONS.length];
              return (
                <div
                  key={index}
                  className="p-6 bg-white/5 border border-border rounded-xl hover:border-[hsl(var(--nav-theme)/0.5)] transition-colors"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <Icon className="w-5 h-5 text-[hsl(var(--nav-theme-light))]" />
                    <span className="text-xs px-2 py-1 rounded-full bg-[hsl(var(--nav-theme)/0.1)] border border-[hsl(var(--nav-theme)/0.3)]">
                      {card.role}
                    </span>
                  </div>
                  <h3 className="font-bold text-lg mb-2 text-[hsl(var(--nav-theme-light))]">
                    {card.name}
                  </h3>
                  <p className="text-muted-foreground text-sm">{card.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Module 5: Demonfall Maps and Locations */}
      <section
        id="maps-and-locations"
        className="scroll-mt-24 px-4 py-14 md:py-20"
      >
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-8 md:mb-12 scroll-reveal">
            <ModuleHeader icon={MapIcon} title={t.modules.demonfallMapsAndLocations.title} />
            <p className="text-base md:text-lg text-muted-foreground max-w-3xl mx-auto">
              {t.modules.demonfallMapsAndLocations.intro}
            </p>
          </div>

          {/* 桌面端表格 */}
          <div className="hidden md:block overflow-x-auto rounded-xl border border-border">
            <table className="w-full text-sm">
              <thead className="bg-white/5">
                <tr>
                  <th className="text-left p-4 font-semibold">Location</th>
                  <th className="text-left p-4 font-semibold">Type</th>
                  <th className="text-left p-4 font-semibold">Purpose</th>
                  <th className="text-left p-4 font-semibold">Notable Features</th>
                </tr>
              </thead>
              <tbody>
                {t.modules.demonfallMapsAndLocations.locations.map(
                  (loc: any, index: number) => (
                    <tr key={index} className="border-t border-border">
                      <td className="p-4 font-semibold text-[hsl(var(--nav-theme-light))]">
                        {loc.location}
                      </td>
                      <td className="p-4">
                        <span className="text-xs px-2 py-1 rounded-full bg-[hsl(var(--nav-theme)/0.1)] border border-[hsl(var(--nav-theme)/0.3)]">
                          {loc.type}
                        </span>
                      </td>
                      <td className="p-4 text-muted-foreground">{loc.purpose}</td>
                      <td className="p-4 text-muted-foreground">
                        {loc.notable_features.join(", ")}
                      </td>
                    </tr>
                  ),
                )}
              </tbody>
            </table>
          </div>

          {/* 移动端卡片 */}
          <div className="md:hidden space-y-4">
            {t.modules.demonfallMapsAndLocations.locations.map(
              (loc: any, index: number) => (
                <div
                  key={index}
                  className="p-4 bg-white/5 border border-border rounded-xl"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-bold text-[hsl(var(--nav-theme-light))]">
                      {loc.location}
                    </h3>
                    <span className="text-xs px-2 py-1 rounded-full bg-[hsl(var(--nav-theme)/0.1)] border border-[hsl(var(--nav-theme)/0.3)]">
                      {loc.type}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">{loc.purpose}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {loc.notable_features.map((f: string, fi: number) => (
                      <span
                        key={fi}
                        className="text-xs px-2 py-0.5 rounded bg-white/5 border border-border"
                      >
                        {f}
                      </span>
                    ))}
                  </div>
                </div>
              ),
            )}
          </div>
        </div>
      </section>

      {/* 广告位 6: 移动端横幅 */}
      {mobileBannerAd && (
        <AdBanner
          type={mobileBannerAd.type}
          adKey={mobileBannerAd.adKey}
          className="md:hidden"
        />
      )}

      {/* Module 6: Demonfall Weapons and Skills */}
      <section
        id="weapons-and-skills"
        className="scroll-mt-24 px-4 py-14 md:py-20 bg-white/[0.02]"
      >
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-8 md:mb-12 scroll-reveal">
            <ModuleHeader icon={Sword} title={t.modules.demonfallWeaponsAndSkills.title} />
            <p className="text-base md:text-lg text-muted-foreground max-w-3xl mx-auto">
              {t.modules.demonfallWeaponsAndSkills.intro}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {t.modules.demonfallWeaponsAndSkills.items.map(
              (item: any, index: number) => {
                const Icon = WEAPON_ICONS[index % WEAPON_ICONS.length];
                return (
                  <div
                    key={index}
                    className="p-6 bg-white/5 border border-border rounded-xl hover:border-[hsl(var(--nav-theme)/0.5)] transition-colors"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <Icon className="w-5 h-5 text-[hsl(var(--nav-theme-light))]" />
                      <span className="text-xs px-2 py-1 rounded-full bg-[hsl(var(--nav-theme)/0.1)] border border-[hsl(var(--nav-theme)/0.3)]">
                        {item.type}
                      </span>
                    </div>
                    <h3 className="font-bold mb-2">{item.name}</h3>
                    <p className="text-muted-foreground text-sm mb-2">
                      {item.description}
                    </p>
                    <p className="text-xs text-[hsl(var(--nav-theme-light))]">
                      {item.combat_role}
                    </p>
                  </div>
                );
              },
            )}
          </div>
        </div>
      </section>

      {/* Module 7: Demonfall Boss Guide */}
      <section id="boss-guide" className="scroll-mt-24 px-4 py-14 md:py-20">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-8 md:mb-12 scroll-reveal">
            <ModuleHeader icon={Skull} title={t.modules.demonfallBossGuide.title} />
            <p className="text-base md:text-lg text-muted-foreground max-w-3xl mx-auto">
              {t.modules.demonfallBossGuide.intro}
            </p>
          </div>

          <div className="scroll-reveal space-y-3">
            {t.modules.demonfallBossGuide.bosses.map((boss: any, index: number) => (
              <div
                key={index}
                className="border border-border rounded-xl overflow-hidden bg-white/5"
              >
                <button
                  onClick={() =>
                    setBossExpanded(bossExpanded === index ? null : index)
                  }
                  className="w-full flex items-center justify-between p-5 text-left hover:bg-white/5 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Skull className="w-5 h-5 text-[hsl(var(--nav-theme-light))]" />
                    <div>
                      <span className="font-semibold block">{boss.boss}</span>
                      <span className="text-xs text-muted-foreground">
                        {boss.location}
                      </span>
                    </div>
                  </div>
                  <ChevronDown
                    className={`w-5 h-5 flex-shrink-0 transition-transform ${bossExpanded === index ? "rotate-180" : ""}`}
                  />
                </button>
                {bossExpanded === index && (
                  <div className="px-5 pb-5">
                    <p className="text-sm text-muted-foreground mb-3">
                      {boss.strategy}
                    </p>
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                      Preparation
                    </p>
                    <ul className="space-y-1.5">
                      {boss.preparation.map((p: string, pi: number) => (
                        <li
                          key={pi}
                          className="flex items-start gap-2 text-sm text-muted-foreground"
                        >
                          <Check className="w-4 h-4 text-[hsl(var(--nav-theme-light))] mt-0.5 flex-shrink-0" />
                          {p}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 广告位 7: 模块间横幅 */}
      <AdBanner
        type="banner-300x250"
        adKey={process.env.NEXT_PUBLIC_AD_BANNER_300X250}
        className="md:hidden"
      />
      <AdBanner
        type="banner-468x60"
        adKey={process.env.NEXT_PUBLIC_AD_BANNER_468X60}
        className="hidden md:flex"
      />

      {/* Module 8: Demonfall Updates and News */}
      <section
        id="updates-and-news"
        className="scroll-mt-24 px-4 py-14 md:py-20 bg-white/[0.02]"
      >
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-8 md:mb-12 scroll-reveal">
            <ModuleHeader icon={Bell} title={t.modules.demonfallUpdatesAndNews.title} />
            <p className="text-base md:text-lg text-muted-foreground max-w-3xl mx-auto">
              {t.modules.demonfallUpdatesAndNews.intro}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {t.modules.demonfallUpdatesAndNews.items.map(
              (item: any, index: number) => {
                const Icon = UPDATE_ICONS[index % UPDATE_ICONS.length];
                return (
                  <div
                    key={index}
                    className="p-6 bg-white/5 border border-border rounded-xl hover:border-[hsl(var(--nav-theme)/0.5)] transition-colors"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <Icon className="w-5 h-5 text-[hsl(var(--nav-theme-light))]" />
                      <span className="text-xs px-2 py-1 rounded-full bg-[hsl(var(--nav-theme)/0.1)] border border-[hsl(var(--nav-theme)/0.3)]">
                        {item.category}
                      </span>
                    </div>
                    <h3 className="font-bold mb-2">{item.title}</h3>
                    <p className="text-muted-foreground text-sm">
                      {item.description}
                    </p>
                  </div>
                );
              },
            )}
          </div>
        </div>
      </section>

      {/* Latest Updates Section - 动态最新文章（置于 8 模块之后） */}
      <LatestGuidesAccordion
        articles={latestArticles}
        locale={locale}
        max={12}
      />

      {/* FAQ Section */}
      <Suspense fallback={<LoadingPlaceholder />}>
        <FAQSection
          title={t.faq.title}
          titleHighlight={t.faq.titleHighlight}
          subtitle={t.faq.subtitle}
          questions={t.faq.questions}
        />
      </Suspense>

      {/* CTA Section */}
      <Suspense fallback={<LoadingPlaceholder />}>
        <CTASection
          title={t.cta.title}
          description={t.cta.description}
          joinCommunity={t.cta.joinCommunity}
          joinGame={t.cta.joinGame}
        />
      </Suspense>

      {/* Ad Banner 3 */}
      <AdBanner
        type="banner-300x250"
        adKey={process.env.NEXT_PUBLIC_AD_BANNER_300X250}
        className="md:hidden"
      />
      <AdBanner
        type="banner-728x90"
        adKey={process.env.NEXT_PUBLIC_AD_BANNER_728X90}
        className="hidden md:flex"
      />

      {/* Footer */}
      <footer className="bg-white/[0.02] border-t border-border">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            {/* Brand */}
            <div>
              <h3 className="text-xl font-bold mb-4 text-[hsl(var(--nav-theme-light))]">
                {t.footer.title}
              </h3>
              <p className="text-sm text-muted-foreground">
                {t.footer.description}
              </p>
            </div>

            {/* Community - External Links Only */}
            <div>
              <h4 className="font-semibold mb-4">{t.footer.community}</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a
                    href="https://discord.com/invite/fireheart"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-[hsl(var(--nav-theme-light))] transition inline-flex items-center gap-1"
                  >
                    {t.footer.discord}
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </li>
                <li>
                  <a
                    href="https://www.reddit.com/r/Demonfall"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-[hsl(var(--nav-theme-light))] transition inline-flex items-center gap-1"
                  >
                    {t.footer.twitter}
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </li>
                <li>
                  <a
                    href="https://www.roblox.com/games/4855457388/Demonfall"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-[hsl(var(--nav-theme-light))] transition inline-flex items-center gap-1"
                  >
                    {t.footer.steamCommunity}
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </li>
                <li>
                  <a
                    href="https://www.roblox.com/games/4855457388/Demonfall"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-[hsl(var(--nav-theme-light))] transition inline-flex items-center gap-1"
                  >
                    {t.footer.steamStore}
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </li>
              </ul>
            </div>

            {/* Legal - Internal Routes Only */}
            <div>
              <h4 className="font-semibold mb-4">{t.footer.legal}</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link
                    href="/about"
                    className="text-muted-foreground hover:text-[hsl(var(--nav-theme-light))] transition"
                  >
                    {t.footer.about}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/privacy-policy"
                    className="text-muted-foreground hover:text-[hsl(var(--nav-theme-light))] transition"
                  >
                    {t.footer.privacy}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/terms-of-service"
                    className="text-muted-foreground hover:text-[hsl(var(--nav-theme-light))] transition"
                  >
                    {t.footer.terms}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/copyright"
                    className="text-muted-foreground hover:text-[hsl(var(--nav-theme-light))] transition"
                  >
                    {t.footer.copyrightNotice}
                  </Link>
                </li>
              </ul>
            </div>

            {/* Copyright */}
            <div>
              <p className="text-sm text-muted-foreground mb-2">
                {t.footer.copyright}
              </p>
              <p className="text-xs text-muted-foreground">
                {t.footer.disclaimer}
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

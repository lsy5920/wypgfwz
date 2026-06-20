import { useState } from "react";
import { ChevronDown, ChevronRight, BookOpen } from "lucide-react";

const chapters = [
  {
    num: "卷首语",
    title: "立派缘起",
    content: `甲辰之后，世事多艰；人心浮沉，各有风雨。有人奔波于市井，夜深无人可诉；有人困顿于前路，抬头不见星河；有人身在人群，却心似孤舟。故立一派，名曰"问云派"。

问云者，非问吉凶祸福，乃问天地辽阔、问本心归处、问同道何在。云行无定，而终归苍穹；人有迷时，亦可寻路。愿此派不作高台说教，不立神坛权威，只愿成为诸君疲惫时可歇之亭、迷茫时可望之灯、孤独时可归之处。

问云派之本愿：以温柔结社，以清醒立身，以陪伴渡人，以成长自渡。

本《立派金典》既为问云派之精神文书，亦为社群运行之基本章程。凡入问云者，皆应知其愿、明其界、守其规、护其风气。`,
  },
  {
    num: "一",
    title: "立派宗旨",
    content: `问云派为古风特色现代社群，初以微信群为坛，后视规模与缘分，择机开设线下雅集、茶会、读书会、行旅会与公益互助之事。

本派宗旨有四。

其一，陪伴。使孤者不孤，使疲者可息，使久困心事之人，得一方可安心言说之地。

其二，清醒。不以热闹遮蔽现实，不以虚言蛊惑人心。愿同门在互相照见中，慢慢明白自己、整理生活、重建秩序。

其三，成长。以读书、写作、谈心、行走、分享、互助为径，使人心不荒，使志气不灭，使日子有光。

其四，守正。依法而行，依平台规则而行，尊重个人边界，守护信息安全，反对欺骗、操控、PUA、传销、非法集资、谣言传播及任何伤害同门之事。`,
  },
  {
    num: "二",
    title: "派名释义",
    content: `"问"者，是提问，是自省，是不轻易把人生交给答案。本派鼓励发问：问生活、问情绪、问关系、问未来、问自己真正所求。

"云"者，是辽阔，是流动，是不执一端。云无定形，故能随风而行；人无定局，故可重新开始。

"派"者，是同道相聚，不是门墙森严。入派者皆为同门，不论出身、职业、年龄、境遇，只问是否真诚、善意、守矩、愿意共同建设一方清明之地。`,
  },
  {
    num: "三",
    title: "派训与精神象征",
    content: `问心，问路，问云深处；

守善，守界，守一盏灯。

本派八字派训为：清醒温柔，同行自渡。

本派以"云、灯、舟、竹"为四象：云，象征自由与包容；灯，象征陪伴与希望；舟，象征渡己渡人，但不替人掌舵；竹，象征有节、有度、有韧性。

凡问云同门，当如云之宽，如灯之暖，如舟之稳，如竹之正。`,
  },
  {
    num: "四",
    title: "问云三不立",
    content: `为防社群走偏，本派立"三不"于前。

一不立神坛。问云派无神化领袖，无绝对权威。掌门、执事、管理员皆为服务者，不得以身份压人。

二不售焦虑。不得借迷茫、孤独、情伤、低谷牟利；不得制造恐惧、依赖与盲从。

三不替专业。本派可陪伴、可倾听、可互助，但不替代心理咨询、医疗诊疗、法律服务、财务投资建议。遇严重心理危机、疾病、违法侵害等事项，应及时寻求专业机构、亲友或公共求助渠道。`,
  },
  {
    num: "五",
    title: "问云七愿",
    content: `愿入此派者，共守七愿。

一愿真诚。言不必尽完美，但求不虚伪、不欺瞒、不以人心为戏。

二愿温和。讨论可有锋芒，待人不可刻薄。

三愿清醒。安慰不等于纵容，陪伴不等于沉溺，理解不等于无边界。

四愿互助。有余力者扶一把，力不足者不强撑；受助者记恩，不被助者怨怼。

五愿守界。不窥私、不逼问、不越界亲近，不以"关心"为名控制他人。

六愿共建。群不是掌门一人之群，亦不是管理员一人之责。人人皆为此间风气之守护者。

七愿向光。允许低落，允许迷茫，允许暂时无力；但不鼓励沉沦、怨毒、伤己伤人。`,
  },
  {
    num: "六",
    title: "组织之制",
    content: `问云派初立，设以下职分。职分非尊卑，乃分工也。

掌门：创立者与总负责人，主理方向、章程、重大决策、核心氛围与对外事务。

执灯长老：负责社群精神气质、重要谈心、冲突调和、重大成员关怀。须稳重、耐心、守密，不轻易评判他人。

云纪执事：即群规管理员，负责入群审核、群内秩序、违规提醒、公告发布、风险处置。执法须有据，语气须有礼，处置须留痕。

文案执事：负责群公告、活动文案、问云语录、节令寄语、成员故事整理。不得未经同意公开他人隐私。

雅集执事：负责线上活动、读书会、茶话会、主题夜谈、线下聚会筹备。线下活动须安全、公开、可退出。

同门：凡入群并认可本《立派金典》者，皆为问云同门。同门无高低贵贱，唯以真诚、守礼、共建为重。`,
  },
  {
    num: "七",
    title: "入派之仪",
    content: `入派不重繁文，重在知情、自愿、守约。

一问初心。新同门入群前，应知本派为陪伴互助社群，非宗教、非投资、非情感操控、非治疗机构。

二读金典。入群后须阅读本《问云派立派金典》及当期群公告。

三报云帖。新同门可自愿作简短介绍：称呼、所在城市、兴趣、来此所求。不得强制披露真实姓名、住址、单位、收入、情史、疾病等隐私。

四行云礼。新同门可发一句入派愿词：

我入问云，愿守真诚与边界；
愿得陪伴，亦愿予人微光；
不造谣，不伤人，不越界；
于云深处，同行自渡。`,
  },
  {
    num: "八",
    title: "群中可为之事",
    content: `日常问候。早安、晚安、节气、天气、生活小记，皆可为人间烟火。

心事倾诉。可说迷茫、孤独、压力、情绪、关系困惑。回应者宜先共情，再建议；不轻判，不嘲讽。

读书观影。可分享书摘、影评、诗词、音乐、展览、旅行见闻。

成长打卡。可设读书、运动、早睡、写作、学习、求职、整理房间等小目标。打卡重在陪伴，不搞羞辱式监督。

互助问答。生活经验、城市信息、职业建议、情绪整理方法，皆可交流。

节令雅集。可于春分、清明、端午、七夕、中秋、冬至等节令设主题活动。`,
  },
  {
    num: "九",
    title: "群中十禁",
    content: `为护一方清明，立十禁如下。

一禁违法违规内容。不得发布、传播法律法规及平台规则禁止的信息。

二禁谣言与未经核实之"内幕"。涉及公共事件须慎之又慎，不明来源，不转不传。

三禁侮辱、诽谤、威胁、人身攻击。可不同意观点，不可攻击人格。

四禁骚扰与越界私聊。对方明确拒绝后，应立即停止。

五禁泄露隐私。不得公开他人照片、聊天记录、联系方式等，除非已获得明确同意。

六禁广告刷屏。未经管理员同意，不得发布商业广告、课程推广、拉群链接等。

七禁金钱诱导。不得在群内发起借贷、众筹、投资、分红等。

八禁情绪绑架。不得以退群、自伤、曝光等方式威胁他人。

九禁冒名权威。不得伪称心理咨询师、医生、律师等专业身份误导同门。

十禁破坏社群根基。长期挑衅、拉帮结派、恶意截屏外传者，视情节处理。`,
  },
  {
    num: "十",
    title: "问云言谈之法",
    content: `群中言语，宜守"四可四不可"。

可倾听，不审判。别人说苦，不必急着讲大道理。

可建议，不命令。"你可以试试"胜过"你必须这样"。

可陪伴，不拯救。每个人最终仍要为自己的人生掌舵。

可沉默，不冷暴。无力回应时，可说"我现在能量不足，晚些再回"，不必硬撑。

不可阴阳怪气，不可群嘲围攻，不可借玩笑伤人，不可把别人的脆弱当谈资。`,
  },
  {
    num: "十七",
    title: "掌门自律书",
    content: `不以问云之名聚敛私利。

不以同门之信任行操控之事。

不以陪伴之名制造依赖。

不以管理之权压制异议。

不因亲疏定规则，不因喜恶行处罚。

凡有重大事项，当尽量公开、清楚、可解释。

若自身失德失矩，愿受同门监督。`,
  },
  {
    num: "十八",
    title: "问云同门盟约",
    content: `我来此间，非求神迹，非避人生，
只愿在风雨人间，得一处温暖灯火。

我愿真诚言说，也愿安静倾听；
我愿被人陪伴，也愿照亮他人。

我不造谣，不欺人，不窥私，不越界；
我不以痛苦绑架他人，不以善意控制他人。

我知人生终须自渡，
但长夜漫漫，有同道同行，亦是幸事。

今日入问云，
愿守清醒温柔，愿护一方云灯。

云深不知处，问心即归途。`,
  },
  {
    num: "十九",
    title: "结语",
    content: `问云派不是逃离现实之地，而是整理心绪之后重新走向现实之地。

问云派不是许诺永远快乐之地，而是允许人不快乐，却不让人独自沉没之地。

问云派不是谁拯救谁，而是人在风里，彼此递一盏灯。

愿此派立于人间烟火，不失山河诗意。愿诸君来时有风雨，去时有星光。愿问云之名，不负每一颗孤独而仍愿向善的心。

问云派，今日立。

以云为幕，以灯为证。

诸君同道，愿此后同行自渡。`,
  },
];

export const Charter = () => {
  const [expanded, setExpanded] = useState<Set<number>>(new Set([0]));

  const toggle = (i: number) => {
    const next = new Set(expanded);
    if (next.has(i)) next.delete(i);
    else next.add(i);
    setExpanded(next);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 mb-4 text-xs tracking-widest text-[var(--ink-gold)]">
          <BookOpen className="w-3.5 h-3.5" />
          <span>问云派立派金典</span>
          <BookOpen className="w-3.5 h-3.5" />
        </div>
        <h1 className="font-serif text-4xl font-bold text-[var(--ink-deep)] mb-4">立派金典</h1>
        <p className="text-[var(--ink-mid)] text-sm">古风特色现代社群章程</p>
        <div className="mt-4 text-xs text-[var(--ink-mid)]/60 space-y-0.5">
          <p>以云为幕，以灯为证；清醒温柔，同行自渡。</p>
          <p>版本：正式初稿 · 二〇二六年五月</p>
        </div>
        <div className="mt-6 mx-auto w-24 h-px bg-gradient-to-r from-transparent via-[var(--ink-gold)]/50 to-transparent" />
      </div>

      {/* Chapters */}
      <div className="space-y-3">
        {chapters.map((ch, i) => {
          const isOpen = expanded.has(i);
          return (
            <div key={i} className={`rounded-2xl border transition-all ${isOpen
              ? "border-[var(--ink-gold)]/30 bg-[var(--ink-parchment)] shadow-sm"
              : "border-[var(--ink-deep)]/8 bg-white/40 hover:border-[var(--ink-deep)]/15"
              }`}>
              <button
                onClick={() => toggle(i)}
                className="w-full flex items-center justify-between px-6 py-4 text-left"
              >
                <div className="flex items-center gap-3">
                  <span className="font-serif text-sm text-[var(--ink-gold)] w-8 shrink-0">第{ch.num}</span>
                  <span className="font-serif text-base font-medium text-[var(--ink-deep)]">{ch.title}</span>
                </div>
                {isOpen
                  ? <ChevronDown className="w-4 h-4 text-[var(--ink-mid)] shrink-0" />
                  : <ChevronRight className="w-4 h-4 text-[var(--ink-mid)] shrink-0" />
                }
              </button>
              {isOpen && (
                <div className="px-6 pb-6">
                  <div className="w-full h-px bg-[var(--ink-deep)]/8 mb-4" />
                  <div className="prose prose-sm max-w-none text-[var(--ink-deep)]/80 leading-relaxed whitespace-pre-line font-light">
                    {ch.content}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Bottom decoration */}
      <div className="mt-12 text-center">
        <div className="mx-auto w-24 h-px bg-gradient-to-r from-transparent via-[var(--ink-gold)]/50 to-transparent mb-6" />
        <p className="font-serif text-[var(--ink-mid)] text-sm">— 问云派立派金典 · 正式初稿 —</p>
      </div>
    </div>
  );
};

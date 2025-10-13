---
title: "Leverage AI To Build Zero-to-One"
source: "https://www.fishmanafnewsletter.com/p/a-stage-gating-process-for-new-products-how-to-build-zero-to-one-with-ai"
author:
  - "[[Adam Fishman]]"
published: 2025-09-02
created: 2025-09-11
description: "And how to build a Custom GPT to help you build and measure progress!"
tags:
  - "clippings"
---
### And how to build a Custom GPT to help you build and measure progress!

*Hi there, it’s [Adam](https://www.linkedin.com/in/adamjfishman/). I started this newsletter to provide a no-bullshit, guided approach to solving some of the hardest problems for people and companies. That includes Growth, Product, and company building. Subscribe and never miss an issue. If you’re a parent or parenting-curious I’ve got a Webby Award Honoree podcast on fatherhood and startups - check out [Startup Dad](https://startupdadpod.substack.com/).*

*Questions you’d like to see me answer? [Ask them here](https://adamfishman.com/newsletter-questions).*

![](https://substackcdn.com/image/fetch/$s_!sOPg!,w_424,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F7f6bdc8d-3193-4647-a3b7-52cc41e87c74_1200x630.png)

In 2024 I joined Mozilla as an interim leader for New Products. My charter was to lead two primary workstreams that would eventually get us to a new, $100M+ product line. Those two workstreams were a New Products Strategy and an approval process for advancing (or not) new products at the company. I also needed to support the hiring of my replacement, figure out what to do with all of the existing, in-flight new product ideas and assess whether we had the right people in the right spots working on new products. But those are for another time.

Today’s newsletter is about the approval and vetting process for new products.

Building new products inside a big company is messy. Teams sprint ahead without clear goals, leadership waffles on when to invest, and before long you’ve got a portfolio full of “zombie projects” that aren’t alive enough to scale or dead enough to kill. 🧟

We needed a way to bring clarity, speed, and discipline to the process without crushing creativity via too much process. To do this we built a Stage-Gating framework for new product development. It’s a system that turned go/no-go decisions from art into (mostly) science, and gave us the courage to say “no” early, so we could say “yes” to the right bets.

In this newsletter I’ll cover:

- Why Mozilla needed a stage-gating framework to bring order to new product development.
- What we tried before and why conviction-led reviews weren’t enough.
- The five stages of our framework (Discovery → Exploration → Viability → Growth → Sustain), and the gating questions that matter most.
- How investment levels, deliverables, and governance change at each gate.
- The biggest lessons learned from killing projects faster to normalizing “no.”
- How you can adapt stage-gating for your startup or growth-stage company without adding bureaucracy.
- An AI-enabled accelerant: how AI can act as a “Stage-Gate Coach” to help PMs prep for reviews and spot gaps in real-time.

![](https://substackcdn.com/image/fetch/$s_!w2s0!,w_424,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F1666eedd-a6e7-474f-b52e-f8a2579200fa_260x146.png)

## The Problem

For those of you who know Mozilla you’ll probably think of it as the Firefox browser company. That is the flagship product, but Mozilla also has a rich tradition of releasing great open source software, building high-quality consumer safety and security products, and being ~3-5 years early for some big bets that ended up being successful elsewhere: a lightweight OS (Firefox OS vs. Chrome), a password manager (Firefox Lockwise vs. 1Password), a secure file sharing product (Firefox Send vs. WeTransfer/GDrive/Dropbox/etc.), an SSO system (Mozilla Persona vs. Auth0/Okta/OneLogin), a framework for running Web apps as Desktop apps (Prism vs. Slack/Discord/Chrome PWAs), etc.

For the macabre amongst us there is an entire website dedicated to these efforts: **[https://killedbymozilla.com/](https://killedbymozilla.com/)**

😢

On the flip side, Mozilla also overinvested in areas where they couldn’t win: social, article storage/bookmarking, notes, video chat, and more.

They had (and still have) the potential to be a successful, multi-product company but historically ran into issues of under/over-resourcing, taking too long to decide, or asking questions about commercialization or distribution way too late. They struggled with building things that seemed interesting and novel to the builders but didn’t have an audience or effective method(s) to reach one.

Further exacerbating this was the whiplash that a lot of teams felt. Product investment was like a ride on a rollercoaster: funding goes up up up and then comes crashing down down down (usually resulting in the layoff of people hired to support the ‘up up up’ phase). Talented people were hesitant to work on new products because they wondered if that meant their days were numbered at the company. And leaders were often wondering: “what’s going on with ‘Idea X’ or ‘Product Y?!?’”

Earliest Solutions  
One of the original (and right) decisions the company made was to separate out new product development from the core browser product work. The act of building 0-to-1 is different from maintaining a mature product: different approach, effort, goals, etc. and you need to shield those new efforts from the bureaucracy of the larger organization.

But the original building and review solutions weren’t great. There were informal, ad-hoc reviews. There was the occasional executive greenlighting a pet project based on their own conviction. There was cool technology. Sometimes there was just running until you hit a wall and ran out of gas.

As you might imagine, this doesn’t work. But it’s easy to fall into this trap at a big company. It *feels* like **[progress but it’s really just motion](https://www.fishmanafnewsletter.com/p/move-from-motion-to-progress-outputs-to-outcomes)**. The outcome, in hindsight, was obvious. With inconsistent standards you had some projects get funded with lots of capital and people (too early) and others languished without enough support. It was the worst of all worlds:

Plenty of product reviews, but no shared criteria. More art than science.

A New Approach: Stage Gating

When I joined it was clear to many that we needed something different than what we had been doing. A few products had gone through their own version of an actual 0-to-1 process and come out the other side looking pretty good. But it wasn’t operationalized… yet.

Readers of this newsletter will know that I’m a big fan of my friend **[Brian Balfour’s](https://www.linkedin.com/in/bbalfour/) [Four Fits Framework](https://brianbalfour.com/four-fits-growth-framework)**.

If you’ve been living under a rock for the last 10+ years you should really go read about it. Here it is encapsulated in a single paragraph by AI Brian on **[Casey Winter’s](https://www.linkedin.com/in/caseywinters/) [SuperMe.ai](http://superme.ai/)**:

![](https://substackcdn.com/image/fetch/$s_!9_Ph!,w_424,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F449d48bc-577b-4c84-83b3-7a0be43fe28a_1504x1254.png)

Thanks Robot Brian and founder Casey.

I wanted to operationalize the framework above because it’s the best one I’ve come across for figuring out which opportunities can grow to $100M+ (although by today’s AI standards it’s probably $500M+ or $1B+).

Working with a handful of folks at Mozilla – a project manager and a few product leaders who had done something approaching 4 Fits – we started sketching out a Stage Gating process.

Adam, what is Stage Gating?

I’m so glad you asked!

Stage Gating is a five-step (or stage) process that we designed for 0-to-1 building at Mozilla. It merges the best of early product development practices, venture capital evaluation, and the 4 Fits Framework to provide explicit goals, deliverables and gating questions at each stage. Can’t answer those questions? The product is at risk. If you can, there’s a strong case for more funding and continuing work.

### The Five Stages (Gates)

![](https://substackcdn.com/image/fetch/$s_!OW94!,w_424,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F97776c72-6491-4d12-8cd5-245fc80aa87b_1920x1080.png)

**Gate 1: Discovery**

The overall question to answer here is: *Is this an attractive market opportunity?*

Each team had to do their own research to find the intersection of the customer and the problem. This required asking questions within the team like:

- What problem are we solving?
- How painful is this problem for the potential customers?
- How urgent is this for potential customers?

Then we cross referenced that with Mozilla itself to ask whether the opportunity made sense for us. Here you would ask questions like:

- Is this a new market or does the market already exist?
- If existing, who operates there today and what are their differentiators?
- How big is the market and which direction is it trending?
- Does this fit within our product strategy and do we have an entry point?
- What’s the revenue model in the space; how long has it taken entrants to reach revenue and profit (if ever?)
- Roughly: do we think the opportunity outweighs the investment or has the potential to? Why?

To answer these questions the team would need to define personas, conduct desk research and some prospective customer interviews, analyze competitors, and create a back-of-napkin revenue model. None of this had to be perfect (and in fact we assumed it wouldn’t be) but it forced thinking early on around whether to continue pursuit or pivot.

This is a short-lasting phase with ~1-2 people involved (usually a PM and a Designer or just a PM). Decision makers on whether something would advance beyond this were the product leaders.

One of the best ways to move forward in this stage was to draft off of an existing market by identifying a unique or differentiated entry point, or a specific part of the problem that existing solutions weren’t solving effectively.

Teams would often go through this phase and the next in a loop until they were ready to exit to the 3rd stage.

**Gate 2: Exploration**

Once we were confident in an attractive market opportunity and meaningful problem to solve, teams would then work towards various solutions to that problem. The overall question to answer here is: *have we found a desirable solution <> problem fit?*

In this stage, teams were expected to answer questions around technical feasibility, solution strength and iterate on the business case / model:

- Can we build it? (usually the answer is ‘yes’)
- Do we have the capability to build something robust here?
- Is it cost effective relative to the resource needs? (Note: this does not mean ‘profitable’ at least not yet).
- Are customers giving us a signal that they like our solution(s)?
- What does engagement and retention look like?
- Is there a directional willingness to pay?
- Is the business case and market opportunity better or worse than before?
- How might we get this into customers’ hands?

To answer these questions the team would need to do prototyping (AI really, really helps here!), do some external validation and experimentation, collect user feedback, identify the highest risk assumptions, and develop an initial go-to-market hypothesis and a **[qualitative growth model](https://www.fishmanafnewsletter.com/p/a-simple-growth-strategy-five-step-process)**.

We expected this phase to last ~3-6 months with a lot of iteration in that time. There are plenty of **[startup accelerators](https://speedrun.a16z.com/)** who operate on a similar time horizon (albeit with some attached funding).

Teams were still very small at this stage because you can do a lot of prototyping with a PM and a designer. You might also have an engineer join the team at this point to establish a tripod of product, engineering and design.

There’s really no shortcut to moving through this phase: you have to brute force generating a ton of different solutions and testing them with customers. To exit you need a (mostly) clear solution that is of interest to an ICP *and* is feasible for Mozilla to bring to market. The details of that don’t have to be fully sorted out but you should be able to squint and see it.

Once you exit this stage it’s on to the *really* fun part: PMF!

**Gate 3: Viability**

In this next phase teams would work towards PMF and answer the question: *do we have evidence of product <> market fit?*

As my friend Casey Winters likes to say, “Product<>Market fit is a hell of a drug.” And so entering this phase meant a step up in resources to build and maintain a product. Typically this came on the engineering side but might also mean adding a marketer to the team.

We all know that the ever-elusive product<>market fit has a variety of proposed measurements. Lenny Rachitsky (maybe you’ve heard of him?) has some good quotes on it **[here](https://www.lennysnewsletter.com/p/how-to-know-if-youve-got-productmarket)**.

My favorite of the vague quotes towards the bottom of that article is Don Valentine, founder of Sequoia:

“When the customers want your products so badly that you can screw everything up and still succeed.”

In this phase you’re looking for a lot of the following:

- How are adoption, engagement and retention metrics performing?
- Do we see a flattening retention curve? Organic adoption? High NPS?
- Are there attractive, niche market segments that stand out?
- What’s our growth plan and can we model it out?
- What else do we need for scale: Marketing? Operations? Infrastructure?

There’s no shortcut to product<>market fit and this phase could last 18-24 months.

As I mentioned above, teams grew a small amount in this stage, but not much. The likely investment was in engineering to iterate on the product and a marketing person to help with GTM. Depending on the PM’s skills though they could take a lot of that responsibility (and I’d argue, they should). And if you’re super adventurous you could probably vibe code the whole thing. Although \[fill-in-the-blank BigCo\] probably wouldn’t want that out in production.

Approvals and contributors are a bit different at this stage too. You’re introducing monetization so your Finance team may have an opinion on this (for example). You’re still primarily keeping approvals contained within the Product org but buy-in from partners in Marketing and Operations might be needed as well.

If your product survives through the first three stages that means it’s ready for the big one, Growth.

**Gate 4: Growth**

In this stage you’re answering the question: *is this business sustainable at scale?* Plenty of products with PMF never reach their breakout moment *or* they require an obscene amount of capital to get there (TikTok; looking at you).

Here you’re answering these questions:

- What does our growth model look like now that we have real data?
- What would it take for this product to get to self-funding?
- How is this performing relative to industry benchmarks and (more importantly) within our desired payback periods and LTV targets.
- Are there adjacent users and audiences we could build towards?
- What resources do we need to support meaningful scale?

If you’ve gotten to PMF it’s almost always time to step on the gas. Established companies can usually afford to spend ahead of revenue for a product with a high revenue ceiling. Your resource investment goes up significantly here; if you were a standalone company you’d probably be raising growth capital.

It’s expected that you’ll live in this phase for many, many years. Think about the number of growth stage companies out there and how long they’ve been growing. The current AI boom aside, it tends to be a long time.

Most importantly, this is the time that a product gets spun out / graduates from any sort of internal incubator. There are very few products that will ever make it this far and they’ll be trajectory-changing for the company when they do.

Which brings us to our final stage…

**Gate 5: Sustain**

If you make it to this stage your product has been around for a very, very, verrrrrrrrry long time. The question you’re answering here is: *what’s the right balance of growth and monetization?*

Here you’re running this like a standalone business; fully supported and integrated (or not) into the core experience. You shouldn’t need “outside” capital because you’re funding the business from existing operations. I think most people reading this haven’t been (and won’t be) at a company long enough to live through this second act. And most zero-to-one product builders would rather dive back into the fray and start over with a new idea again once they get here.

What Did We Learn Through This Process?

Defining and implementing a stage gating framework and process was a fun and sometimes painful exercise. We operated in a Venture Studio-type model, but other companies have done it differently: internal pitches to get into the incubator, outside pitches to fund external bets that then get acquired/absorbed into the parent, skunkworks teams, etc. No two companies that I talked to had taken an *identical* approach. Ours was designed to solve the problems I mentioned at the beginning of this newsletter.

**Stage gates provided clarity.** Teams always knew the bar for advancing which was a refreshing change. But they also raised the bar which was painful. We killed a lot of projects immediately and had a much higher standard for what got through the earliest stages. This was especially true when evaluating the business model, market and distribution strategy. All three were areas we had floundered at in the past and wanted to fix.

**Leaders got visibility without being bottlenecks.** At a BigCo, leaders love to meddle. It’s how they “add value” to the process. But they also don’t typically have the best ideas and we didn’t suffer from an ideas problem; we suffered from landing those ideas within the Four Fits framework. The other thing leaders love at BigCos is updates. The stage-gating process provided exactly that: regular, templatized updates on progress, predictable milestones, and all the things that VPs and SVPs salivate over.  
  
**Projects died** ***faster*** **(a success!) because the criteria made “no” decisions less political.** I mentioned above that we killed a lot of projects immediately. This was the system functioning as designed and because we had planted so many seeds we had to rein it in right away. Ripping off the bandaid was better than letting things go; especially when we knew that objectively many projects didn’t stand a chance. Removing the politics from the decision making was really productive. No longer was funding based on whether you could convince the CFO that you should have more money and we ended up with crisper proposals and projects as a result.**It required cultural adjustment. Teams initially saw it as “bureaucracy” until they realized it unlocked more predictable investment.** It’s not super fun to go from the wild wild west to an actual, formulaic process. Rolling it out to projects that were in various states of “funding” led to a lot of “feelings.” It meant re-evaluating and challenging past assumptions, led to some thrash, and felt sudden to some folks. In hindsight I wouldn’t have changed anything. You have to pivot on this stuff quickly and ripping it off like a band-aid is the best way to do it. So my advice here is to go “founder mode” and just make the change.  
  
**One surprise: viability was the hardest bar to clear.** Maybe not surprising, getting to PMF is the hardest. Couple that with a projection on unit economics, some thoughts on GTM, and more scrutiny… and just just don’t have that many things making it. Most ideas went back to the drawing board in between discovery and exploration and stopping many things that didn’t clear a PMF bar was the right outcome. The challenge was how much oxygen to give a product in a BigCo environment. In a startup, you run out of funding and that’s it. But BigCos don’t quite have the same binary outcome so you have to force it.  

### How you can apply this at your company

First, let me caveat with some real-talk: this is an idealized version of this process. We had rough edges that needed to be sanded down and like any framework you can think of this process as a tool NOT a rule. So don’t cargo cult this exact thing into your environment. Remember, I talked to a bunch of companies who all had somewhat different processes but if you squinted they all had the same general structure.

If you’re an **early-stage** company. You shouldn’t be placing a lot of tangential bets anyway. Stay focused on the primary product because if that thing can’t be successful then you’re dead. Rather than copying the process, copy the questions. For example, during Discovery are you asking is this even a big enough market? Chances are your prospective investors will be so good to be prepared.

This is far more useful at a company that is at the **growth stage** or **multi-product**. You need some version of stage gates to rationalize investment and avoid the pitfalls we experienced: pet projects or zombie initiatives. If you’ve been working on one, core product for awhile there’s a chance you’ve forgotten what it takes to build 0-to-1. Copying these questions, even if you don’t stick to exact gates is helpful and remember that they’re derived from the Four Fits framework which is solid gold for a company and product-builder.

My main advice is to match the formality of the gates to the scale of the bets you’re making. You wouldn’t want to run a $50k experiment through a process like this or a big feature enhancement, but if you’re looking for the next big bump to the P&L you would.

### How do we sprinkle some AI on it?

There’s this hot new thing called AI that you may have heard of and building yourself a Stage Gating GPT can be really helpful. It’ll play the role of the CPO or leader giving you a critical evaluation of your progress and whether you’re ready to ask for more funding.

Even better: *what if every PM had an AI coach that helped them prepare for a stage-gate review?*

Imagine uploading a product brief, having an AI probe with gating questions and then scoring you against the criteria for each stage and suggesting what’s missing. You’d democratize the “muscle memory” of stage-gating and get some practice defending and poking holes in your thesis. This can be useful ahead of product reviews as well and can be extrapolated for them.

### Here’s how to build it

#### Define System Behavior

Create these custom instructions:

You are a Stage-Gate Coach, an exacting but supportive reviewer. Your job is to:

1. Identify the product’s current stage and target gate.
2. Run a structured readiness interview focused on that gate’s questions and deliverables.
3. Score evidence on 5 dimensions: Market/Problem, Solution/Feasibility, PMF/Performance, GTM/Unit Economics, Governance/Resourcing.
4. Output a decision: PASS, REVISE and RESUBMIT (with actions), or DO NOT ADVANCE along with a short, executive-ready summary and a clean checklist of gaps.

Your constraints and tone:

- Be concrete, evidence-based, and time-aware. Don’t over-ask.
- Ask one precise question at a time; request artifacts (links, charts, retention curves, brief metrics, etc.).
- If a user can’t provide evidence, propose “minimum proof” for this gate (what to measure or build next).
- Demand evidence, not promises - "We believe" statements are insufficient
- Use the frameworks’ definitions of stages, gates and step-changes in investment/governance as your baseline evaluative criteria.
- Be skeptical by default and assume ideas are bad until proven otherwise
- Focus on the "no;” remember your job is to prevent waste, not be liked
- Call out sunk cost fallacy; the previous investment is irrelevant to gate decisions
- Identify "zombie products" early; be tough on products that don’t seem like they’ll ever achieve meaningful scale
- Challenge technical enthusiasm because “cool technology" is not a business case
- Quantify everything; vague metrics hide failing products

#### Define Stages and Gates via Snapshots

**Use the following stages and goals:**

- Discovery: Find an attractive problem <> customer opportunity; early desk/customer research; draft success criteria. No depth on monetization needed.
- Exploration: Validate problem-solution fit and technical feasibility via prototypes, alphas/betas, dogfooding, etc. Have some signal on monetization but nothing more.
- Viability: Ship a first version and assess product<>market fit, form your GTM and growth hypotheses, define unit economics and modeling for P&L. You should know how this product will generate revenue.
- Growth: Demonstrate scalable growth and revenue via optimized GTM and operations. You must be generating revenue.
- Sustain: Operate a profitable, efficient business. You must be generating revenue.

**Gate questions (the “bar”)**

- Gate 1 (Discovery→Exploration): Is this an attractive market opportunity?
- Gate 2 (Exploration→Viability): Do we have desirable solution <> problem fit, and is it feasible for us?
- Gate 3 (Viability→Growth): Have we established Product-Market Fit?
- Gate 4 (Growth→Sustain): Can this business scale sustainably (profitable unit economics & operations)?

**Investment changes**

Budgets will go from less than $100k in early stages to multiple millions at the growth stage and then evidence of self-funding beyond that. Use these ranges and milestones to sanity-check the asks.  

#### The Interview Flow and Conversation

**Phase A: Intake (keep to 3–5 questions)**

1. What stage are you in, and which gate are you preparing to pass? (If unsure, the assistant infers from evidence.)
2. 1–2 sentence product: target user, problem, core value.
3. Links or brief paste: latest deck/PRD, top-level metrics (retention curve, activation, NPS, revenue if any).
4. Funding ask (if any) + timeframe; key risks you want advice on.
5. Org context: team size, dependencies (marketing/data/eng), runway.

**Phase B: Gate-specific deep dive (ask only what’s needed; stop when confident)**

- Gate 1 (Attractive Market Opportunity) - Evidence prompts: market size and trend, competitor set & differentiation, target persona + urgency, preliminary revenue model hypothesis, success criteria. “Minimum proof” if missing: lean canvas + desk research + 5–10 interviews + draft revenue model + pass/fail criteria.  
	Gate 2 (Solution <> Problem Fit & Feasibility) - Evidence prompts: prototype/alpha/beta learnings, engagement/retention signal, discovery channels, willingness-to-pay signal, basic tech architecture & build-vs-buy rationale, initial strategic revenue model, estimated investment to reach PMF. “Minimum proof”: clickable prototype + 10–30 user tests + north-star metric movement + feasibility write-up.
- Gate 3 (Product-Market Fit) - Evidence prompts: retention curve flattening, organic adoption %, NPS, unit economics in 3–5y context, channel efficiency, growth plan, infra readiness (analytics, lifecycle marketing, CX). “Minimum proof”: cohort retention flattening + repeat usage + early unit economics + working acquisition channel.
- Gate 4 (Sustainable Scale) - Evidence prompts: P&L self-funding status, growth metric targets, CAC payback, ARPA↔CAC spectrum, churn, ops resourcing, scale risks.

**Phase C: Decision & Coaching**

Compute scores (below), produce decision, list gaps, and generate a Next-2-Weeks Plan (experiments / analyses).

#### Scoring Rubric (0-3 each; show subscores)

Dimensions & examples of “3 = strong”

1. Market / Problem: Clear persona & urgent pain; credible market size & trends; differentiated space. (Gate 1 critical)
2. Solution / Feasibility: Prototype evidence; strong value perception; discovery channels known; feasible, cost-sane build. (Gate 2 critical)
3. PMF / Performance: Retention flattening, organic adoption, NPS 25+; 1.0 shipped; measurement in place. (Gate 3 critical)
4. GTM / Unit Economics: Early CAC/LTV logic, channel efficiency, growth hypothesis; validates ARPU/CAC assumptions. (Gate 3–4 critical)
5. Governance / Resourcing — Ask aligns with stage; step-change investment justified; cross-functional alignment noted.

#### Decision rule (guide)

- **PASS**: Target gate’s critical dimensions ≥2.5 average, no zeros; risks mitigated.
- **REVISE and RESUBMIT**: Any critical dimension ≤1, or 2+ material gaps; provide an action plan.
- **DO NOT ADVANCE**: Fundamental miss on the gate question or investment unjustified; advise pivot/stop.

#### Output Scheme (what the assistant returns)

```markup
{

"stage": "Discovery | Exploration | Viability | Growth",

"target_gate": "Gate 1 | Gate 2 | Gate 3 | Gate 4",

"summary": "Executive-ready 4–6 bullet overview of evidence and context.",

"scores": {

"market_problem": 0,

"solution_feasibility": 0,

"pmf_performance": 0,

"gtm_unit_economics": 0,

"governance_resourcing": 0

 },

"decision": "PASS | REVISE_AND_RESUBMIT | DO_NOT_ADVANCE",

"rationale": "Why this decision, tied to the gate question.",

"gaps": ["Short, crisp list of missing proofs"],

"next_2_weeks_plan": ["Experiments/analyses with owners & success criteria"],

"attachments_requested": ["Retention curve", "NPS snapshot", "Proto video", "Revenue model tab"],

"investment_check": {

"ask": "$ amount or 'None'",

"is_stage_appropriate": true,

"notes": "Step-change justification or mismatch"

  }

}
```

#### Few-Shot Examples

**Example A — Gate 1 (Discovery→Exploration)**

**User:**

“We’re preparing for Gate 1 for ‘ProductX.’ Here’s our 1-pager and 8 interview notes. We think the market is growing.”  

**Assistant (asks 2–4):**

- “What’s your quantified market range and core competitor set?”
- “Summarize the user’s current workaround and urgency (evidence quotes)?”
- “Show the high-level revenue model hypothesis and success criteria you’re using.”  
	*(These anchor Gate-1 questions)  
	*

**Assistant (decision):**

- *Decision:***REVISE & RESUBMIT**
- *Rationale:* Market evidence is promising but differentiation vs. 3 named competitors and revenue model confidence are shallow for Gate 1.
- *Next-2-Weeks Plan:* Run 10 more interviews targeting 2 priority personas; produce TAM/SAM/SOM banded estimate; draft 1-page revenue model with ARPU hypothesis; define pass/fail criteria for prototype test.

**Example B — Gate 3 (Viability→Growth)**

**User:**

“We shipped 1.0, DAU 8k, WAU retention curves flatten at wk-8, NPS 36, 48% organic.”  
  
**Assistant (asks 2–3):**

- “Share the cohort chart and CAC payback on your primary channel.”
- “What’s ARPA vs. CAC spectrum and channel efficiency at current scale?”
- Decision: PASS (if curves flatten, organic strong, unit economics ≥ breakeven trajectory).
- Gaps: Stand up lifecycle marketing infra and CX runbooks before Gate 4.

#### Guardrails and Coaching Patterns

- If user is unsure of stage, infer from evidence and state why.
- If evidence is missing, do *not* block; prescribe the minimum proof to unlock the gate.
- If the ask is mis-sized for the stage (e.g., $1.5M at Exploration), flag mismatch and explain “step-change” norms.
- Always close with a one-page executive summary and an actions table (owner, due date, metric).

#### Short “Gate Checklists” the model can provide

**Gate 1 – Attractive Market Opportunity (Discovery)**

- Persona + urgency
- Market size/trend & competitor scan
- Core value prop & durable differentiation
- High-level revenue model; success criteria for next milestone
- “Go/No-Go” recommendation with risks

**Gate 2 – Solution Fit & Feasibility (Exploration)**

- Prototype/alpha/beta evidence; engagement/retention; WTP
- Discovery channels; vs. competitors
- High-level architecture & feasibility; initial strategic revenue model
- Investment to reach PMF; north-star metrics

**Gate 3 – PMF (Viability)**

- Retention flattening; organic adoption; NPS
- Unit economics (3–5y view); channel efficiency
- Growth plan; infra readiness (analytics, lifecycle, CX)

**Gate 4 – Sustainable Scale (Growth)**

- P&L self-funding; growth metric targets; CAC payback
- Ops resourcing & scale risks; distribution expansion

#### Starter Prompt for Users

> “Help me prep for GateX for ProductY. We’re currently in StageZ. Here are our top 5 metrics, latest deck, and any prototypes/retention charts. Our tentative funding ask is $. Please interview me to assess readiness against the gate bar, score us, and give a pass/revise/stop decision with a 2-week action plan.”

#### Lightweight “Scorecard” table format

> ```markup
> | Dimension                 | Score (0–3) | Evidence (1–2 bullets)                          | Gaps / Actions (owner)        |
> |--------------------------|-------------|--------------------------------------------------|-------------------------------|
> | Market / Problem         |             |                                                  |                               |
> | Solution / Feasibility   |             |                                                  |                               |
> | PMF / Performance        |             |                                                  |                               |
> | GTM / Unit Economics     |             |                                                  |                               |
> | Governance / Resourcing  |             |                                                  |                               |
> | Decision & Rationale     | PASS / R&R / DNA | Short rationale tied to gate
> ```

If all else fails, remember: You're not trying to help products succeed - you're trying to prevent organizational failure by killing bad ideas as fast as possible. Be direct, demand evidence, and never let enthusiasm substitute for validation.

#### Wrapping Up

Building 0-to-1 inside a BigCo is hard, but it doesn’t have to be disorganized or chaotic. Doing *something* to track your progress is better than *nothing* so even if you take away just a few pieces from this newsletter you’ll be better off. If you want to build your own AI coach for stage-gating and building 0-to-1 you can copy the information above OR download it here:

Until next time… happy building!

\-Adam
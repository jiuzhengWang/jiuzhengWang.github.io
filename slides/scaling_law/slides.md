---
theme: ./theme
title: "Scaling Laws for Continual Learning of LLMs"
author: 王九铮
favicon: /slides/scaling_law/brand/pku-emblem-red.png
themeConfig:
  primary: '#94070A'
transition: fade-out
drawings:
  persist: false
mdc: true
---

# Scaling Laws for Continual Learning of LLMs

<p class="pku-cover-author">王九铮</p>

<BrandImage class="pku-cover-emblem" src="brand/pku-emblem-red.png" />

---

## 汇报问题

本次汇报讨论的是：

<red>当大模型训练过程中引入新的领域数据，如何提升新领域能力，同时保持已有能力？</red>

这里首先要区分新领域数据进入的阶段。

不同阶段对应不同问题：

- 预训练阶段：数据在训练前已经准备好
- 持续预训练阶段：已有模型之后再加入新领域语料
- 指令微调和对齐阶段：新任务、新格式或新偏好进入训练
- 推理阶段：新知识不一定写入参数

----

## 大模型训练-部署流程

<div class="training-flow">
  <div class="flow-stage flow-focus">
    <strong>预训练</strong>
    <span>多域语料<br>静态配比</span>
  </div>
  <div class="flow-arrow">→</div>
  <div class="flow-stage flow-focus">
    <strong>持续预训练</strong>
    <span>新领域语料<br>replay</span>
  </div>
  <div class="flow-arrow">→</div>
  <div class="flow-stage">
    <strong>指令微调</strong>
    <span>任务格式<br>指令数据</span>
  </div>
  <div class="flow-arrow">→</div>
  <div class="flow-stage">
    <strong>强化学习</strong>
    <span>偏好数据<br>奖励模型</span>
  </div>
  <div class="flow-arrow">→</div>
  <div class="flow-stage">
    <strong>推理部署</strong>
    <span>RAG<br>工具调用</span>
  </div>
</div>

<hr>

本次重点讨论前两个阶段：预训练和持续预训练中的新领域数据引入。

----

## 横向与纵向持续学习

**[Continual Learning of Large Language Models: A Comprehensive Survey](https://arxiv.org/abs/2404.16789)** 将 LLM 持续学习分为两个方向：

| 方向 | 含义 | 对应阶段 |
|---|---|---|
| 横向持续学习 | 跨时间、领域、知识源适配 | 预训练、持续预训练、推理 |
| 纵向持续学习 | 从通用能力到具体任务能力适配 | CPT、指令微调、对齐 |

本次汇报主要关注横向持续学习中的预训练和持续预训练问题。

----

## 方法与训练阶段的关系

| 阶段 | 新数据形式 | 常见方法 |
|---|---|---|
| 预训练 | 已知多域语料 | data mixing、质量加权、去重 |
| 持续预训练 | 新领域语料 + 旧域 replay | CPT scaling law、CMR、LR schedule |
| 指令微调 | 新任务和指令格式 | replay、distillation、LoRA / O-LoRA |
| 强化学习 | 新偏好或奖励信号 | KL regularization、reference model |
| 推理部署 | 外部知识或工具 | RAG、tool use、prompt routing |

----

## 汇报组织

1. 经典预训练 scaling law：$N,D,C$ 与 loss
2. data mixing scaling law：静态多域数据的比例建模
3. continual pre-training scaling law：新领域动态进入后的比例和停止点
4. 知识习得与遗忘机制：从知识建模解释持续学习风险
5. 参考文献

---

# 1. 经典 Scaling Law

----

## Scaling law 的基本对象

在预训练中，scaling law 通常描述：

$$
(N,D,C)\quad\longrightarrow\quad L.
$$

其中：

- $N$：参数量
- $D$：训练 tokens
- $C$：训练算力
- $L$：验证 loss 或下游指标

代表工作：**[Scaling Laws for Neural Language Models](https://arxiv.org/abs/2001.08361)**。

----

## Kaplan: 分离式幂律

Kaplan et al. 观察到 loss 与资源规模近似满足幂律：

$$
L(N)\propto N^{-\alpha_N},\quad
L(D)\propto D^{-\alpha_D},\quad
L(C)\propto C^{-\alpha_C}.
$$

核心作用：

- 将训练结果转化为可外推曲线
- 用小规模实验估计大规模收益
- 初步回答给定算力下的规模扩展问题

----

## Chinchilla: 联合建模 $N$ 和 $D$

**[Training Compute-Optimal Large Language Models](https://arxiv.org/abs/2203.15556)** 使用联合形式：

$$
L(N,D)=E+\frac{A}{N^\alpha}+\frac{B}{D^\beta}.
$$

含义：

- $\frac{A}{N^\alpha}$：模型容量不足
- $\frac{B}{D^\beta}$：训练数据不足
- 固定算力下，$N$ 和 $D$ 需要共同扩展

----

## 对持续学习的限制

经典 scaling law 主要把数据看作总量 $D$。

持续学习中，数据还包含分布信息：

- 新领域数据比例
- 通用数据 replay 比例
- 高质量数据占比
- 数据重复次数
- 训练阶段和停止点

<hr>

因此需要将变量从 $D$ 扩展到 $(D,r,t)$。

---

# 2. Data Mixing Scaling Law

----

## Data mixing 多数是静态设定

data mixing scaling law 多数研究静态问题：

- 候选数据源在预训练前已经确定
- 训练前选择固定 mixture
- 预测不同比例下的验证表现

这与持续预训练不同：

- 初始点不是随机模型，而是已有 checkpoint
- 新领域数据在后续阶段进入
- 还要约束旧能力退化

> data mixing 是 CPT 的基础问题，但不是完整的 CPT 问题。

----

## 基本符号

设训练数据来自 $K$ 个来源：

$$
r=(r_1,\ldots,r_K),\quad
r_i\ge 0,\quad \sum_i r_i=1.
$$

总训练量为 $D$，第 $i$ 个来源的训练量为：

$$
D_i=r_iD.
$$

验证 loss 可按验证域写为：

$$
L_j(N,D,r),
$$

其中 $j$ 表示第 $j$ 个验证域。

----

## Data mixing 的目标

data mixing 要选择训练采样比例 $r^*$。在固定模型规模和训练预算下：

$$
r^*=\arg\min_{r\in\Delta^{K-1}} J_{\mathrm{val}}(r),
\quad
J_{\mathrm{val}}(r)=\sum_j s_j L_j(N,D,r).
$$

其中：

- $J_{\mathrm{val}}(r)$：加权验证目标
- $L_j$：第 $j$ 个验证域上的 loss
- $s_j$：第 $j$ 个验证域的权重
- $r_i$：第 $i$ 个数据源采样比例

----

## 同一目标下的方法层级

这些工作同属“选数据比例”问题，但处在不同层级：

| 层级 | 问题 | 代表工作 |
|---|---|---|
| 预测目标 | 估计 $r\rightarrow L_j(r)$ 或 $r\rightarrow J_{\mathrm{val}}(r)$ | Data Mixing Laws, RegMix, BiMix |
| 选择比例 | 不拟合完整 $L(r)$，直接得到采样比例 | DoReMi |
| 扩展变量 | 加入质量、重复率和有效信息量 | InfoLaw |

> 共同点是选择数据比例；差别在估计方式。

----

## 各工作在问题中的位置

| 工作 | 方法 | 输出 |
|---|---|---|
| DoReMi | proxy model + Group DRO | 采样比例 $r$ |
| Data Mixing Laws | 解析式估计 $\hat L_j(r)$ | $r^*$ |
| RegMix | 回归器估计 $\hat y(r)$ | $r^*$ |
| BiMix | 估计 $\hat L_i(r_i,D)$ | $r^*$ |
| InfoLaw | 估计有效信息量 | 扩展目标 |

InfoLaw 不只是 ratio 方法；它把质量和重复率纳入数据选择问题。

----

## DoReMi: proxy model 产生采样比例

**[DoReMi: Optimizing Data Mixtures Speeds Up Language Model Pretraining](https://arxiv.org/abs/2305.10429)** 不是显式 scaling law，但它给出一种低成本配比估计方法。

核心思想：

- 先训练 reference model
- 再用 proxy model 做 Group DRO
- loss 相对 reference 更高的数据源会被提高权重
- 将得到的比例用于大模型预训练

----

## DoReMi: 优化目标

简化目标：

$$
\min_\theta \max_\alpha
\sum_i \alpha_i
\mathbb{E}_{x\sim D_i}
\left[\ell_\theta(x)-\ell_{\mathrm{ref}}(x)\right].
$$

这里 $\alpha_i$ 是 Group DRO 给第 $i$ 个数据来源的权重。

它不是对大模型 loss 曲线的预测，而是用于构造最终采样比例。

----

## Data Mixing Laws: mixture 到 domain loss

**[Data Mixing Laws](https://arxiv.org/abs/2403.16952)** 直接建模 mixture 与验证域 loss 的关系：

$$
L_i(r_1,\ldots,r_M)
=c_i+k_i\exp\left(\sum_j t_{ij}r_j\right).
$$

符号含义：

- $L_i$：第 $i$ 个验证域上的 loss
- $r_j$：第 $j$ 个训练数据来源的比例
- $t_{ij}$：训练来源 $j$ 对验证域 $i$ 的影响
- $c_i,k_i$：拟合常数

该工作还将 mixture law 与 step scaling 和 model-size scaling 组合，用小规模实验预测大规模 mixture。

----

## RegMix: 用回归预测比例效果

**[RegMix: Data Mixture as Regression for Language Model Pre-training](https://arxiv.org/abs/2407.01492)** 不预设解析公式，而是学习：

$$
y=f(r_1,\ldots,r_K)+\epsilon.
$$

其中：

- $y$：目标 loss 或下游指标
- $f$：回归模型
- $r$：数据来源比例

它先训练许多小模型，得到样本 $(r,y)$，再用回归模型预测未训练比例的效果。

----

## BiMix: 比例和训练时长一起建模

**[Data Mixing Made Efficient: A Bivariate Scaling Law for Language Model Pretraining](https://arxiv.org/abs/2405.14908)** 将单域 loss 写成比例和训练步数的函数：

$$
L_i(r_i,s)
=
\frac{A_i}{r_i^{\alpha_i}}
\left(\frac{B_i}{s^{\beta_i}}+C_i\right).
$$

其中：

- $r_i$：第 $i$ 个数据来源比例
- $s$：训练步数或等价训练进度
- $A_i,B_i,C_i,\alpha_i,\beta_i$：待拟合参数

含义：选择数据比例时不能忽略训练时长。

----

## InfoLaw: 质量和重复

**[InfoLaw](https://arxiv.org/abs/2605.02364)** 关注质量加权数据和重复训练。

主要变量：

- 数据质量：影响单位 token 的信息量
- 重复次数：影响边际收益
- 模型规模：影响重复数据的可用程度

结论：

- 高质量数据上采样有收益
- 重复数据收益会衰减
- 小模型或小预算更偏向高质量
- 大模型或大预算更依赖多样性

----

## 与持续学习的关系

data mixing 工作通常假设数据源在预训练前已知。

持续预训练可以看成一个动态版本：

$$
r=(r_{\mathrm{new}},r_{\mathrm{replay}},r_{\mathrm{other}}).
$$

区别在于：

- 初始点不是随机模型，而是已有 checkpoint
- 目标不是单一平均 loss，而是 domain/general trade-off
- $r_{\mathrm{replay}}$ 直接影响遗忘
- 停止点 $t$ 也需要建模

---

# 3. Continual Pre-training Scaling Law

----

## CPT 中的新领域进入方式

继续预训练从已有模型开始：

$$
\theta_{\mathrm{pt}}
\rightarrow
\theta_{\mathrm{cpt}}.
$$

新领域数据进入后，训练集可以写为：

$$
D_{\mathrm{cpt}}
=
D_{\mathrm{new}}
\cup
D_{\mathrm{replay}}.
$$

关键比例：

$$
r_{\mathrm{new}}
=
\frac{|D_{\mathrm{new}}|}
{|D_{\mathrm{new}}|+|D_{\mathrm{replay}}|}.
$$

----

## CPT 的目标

CPT 不是单目标优化。一个常见形式是：

$$
\min_{D,r,t,\eta} L_{\mathrm{dom}}(\theta_t)
$$

$$
\text{s.t.}\quad
L_{\mathrm{gen}}(\theta_t)-L_{\mathrm{gen}}(\theta_0)\le \epsilon.
$$

变量包括：

- $D$：CPT tokens
- $r$：领域数据比例或 replay 比例
- $t$：训练时长或 checkpoint
- $\eta$：learning rate schedule

----

## 与 data mixing 的关系

| 问题 | data mixing | CPT scaling law |
|---|---|---|
| 初始模型 | 随机初始化或从头训练 | 已有 checkpoint |
| 数据进入方式 | 训练前已知 | 新领域后续进入 |
| 主要变量 | $N,D,r$ | $N,D,r,t,\eta$ |
| 目标 | 平均 loss 或下游指标 | 领域收益 + 通用保持 |
| 风险 | 配比不优 | 灾难性遗忘 |

因此 CPT scaling law 不是替代 data mixing，而是将 data mixing 放入持续学习约束中。

----

## D-CPT Law

**[D-CPT Law: Domain-specific Continual Pre-Training Scaling Law for Large Language Models](https://arxiv.org/abs/2406.01375)** 将领域比例放入 scaling law：

$$
L(N,D,r)
=E+\frac{A}{N^\alpha}
+\frac{B r^\eta}{D^\beta}
+\frac{C}{(r+\epsilon)^\gamma}.
$$

其中：

- $N$：模型规模
- $D$：CPT 数据量
- $r$：当前验证域对应语料比例
- $L$：对应验证域上的 loss

领域 loss 使用 $r_{\mathrm{dom}}$；通用 loss 使用 $r_{\mathrm{gen}}$。

----

## CMR Scaling Law

**[CMR Scaling Law: Predicting Critical Mixture Ratios for Continual Pre-training of Language Models](https://arxiv.org/abs/2407.17467)** 直接建模临界领域比例：

$$
R=\frac{|D_{\mathrm{dom}}|}
{|D_{\mathrm{gen}}|+|D_{\mathrm{dom}}|}.
$$

临界比例 $R_{\mathrm{CMR}}$ 满足：

$$
L_{\mathrm{gen}}^{\mathrm{CPT}}\le L_{\mathrm{gen}}+\epsilon,
\quad
L_{\mathrm{dom}}^{\mathrm{CPT}}<L_{\mathrm{dom}}.
$$

即：在通用能力退化不超过阈值时，领域比例尽可能高。

----

## CPT Learning Dynamics

**[Learning Dynamics in Continual Pre-Training for Large Language Models](https://arxiv.org/abs/2505.07796)** 关注整条训练曲线，而不是只预测最终 loss：

$$
L_{\mathrm{CPT}}(t)
=
L_{\mathrm{hidden\ PT}}(S_1,S_2)
+\Delta_{\mathrm{shift}}(S_1^{\mathrm{CPT}},r).
$$

其中：

- $S_1$：learning rate 累计面积
- $S_2$：annealing area
- $\Delta_{\mathrm{shift}}$：分布转移项

它将训练步数、学习率日程、replay 比例和 loss curve 联系起来。

----

## 三类 CPT law 的关系

| 工作 | 主要问题 | 与 data mixing 的关系 |
|---|---|---|
| D-CPT | 给定 $N,D,r$，预测 domain/general loss | 将 mixture ratio 放入 CPT loss 公式 |
| CMR | 找到不破坏通用能力的最大领域比例 | 将 ratio-loss 曲线转化为约束阈值 |
| Learning Dynamics | 预测训练过程中的 loss curve | 在 mixture 基础上加入 $t$ 和 LR schedule |

共同点：都把 $r$ 作为关键变量，并同时观察领域指标和通用指标。

---

# 4. 知识习得与遗忘机制

----

## 本节结构

本节只讨论两件事：

1. 知识如何被建模和习得
2. 如何用这些建模解释持续学习中的遗忘

持续学习方法已经在训练流程中说明，不作为本节主体。

----

## 知识频率与容量

**[The Quantization Model of Neural Scaling](https://arxiv.org/abs/2303.13506)** 将模型能力解释为离散知识或技能单元：

- 高频单元更早被学习
- 低频单元需要更多 exposure
- 模型容量限制可学习单元数量
- 幂律 loss 可由知识频率分布解释

持续学习含义：

<red>新领域数据改变知识频率分布，旧知识如果缺少 replay，可能低于保持阈值。</red>

----

## 压缩视角

**[Understanding LLM Behaviors via Compression](https://arxiv.org/abs/2504.09597)** 将 LLM 训练解释为两部分压缩：

- syntax：高频格式、语法、模板
- knowledge：事实、实体、关系、长尾知识

该文提出 Syntax-Knowledge model，用来解释：

- scaling law
- 知识习得顺序
- hallucination
- fine-tuning 中的遗忘

> 遗忘不只来自新旧知识冲突，也可能来自新格式带来的语法开销。

----

## Syntax-Knowledge: 学习速度不同

在该模型中，fine-tuning 的收益可分为：

- syntax redundancy：学习新格式或新风格
- knowledge redundancy：注入新事实或新知识

两者学习速度不同：

$$
\text{syntax redundancy}: O(n^{-1})
$$

$$
\text{knowledge redundancy}: O(n^{\alpha-1})
$$

含义：格式适配通常很快，知识注入较慢。

----

## Syntax-Knowledge: 遗忘机制

持续学习中的遗忘来自容量竞争：

- 模型容量有限
- 新领域数据可能引入新语法或新格式
- 学习新语法会占用容量
- 当模型接近容量上限时，旧知识更容易被挤出

这解释了 SFT 与 CPT 的差异：

| 方式 | 数据形式 | 遗忘风险 |
|---|---|---|
| SFT | 指令-回答模板 | 语法偏离更大 |
| CPT | 自然文本续训 | 更接近预训练分布 |

> 在容量接近饱和时，CPT 通常比 SFT 更有利于保留旧知识。

----

## 有效暴露

知识学习不只取决于重复次数。

相关工作：

- **[Physics of Language Models: Part 3.1](https://arxiv.org/abs/2309.14316)**：token 记忆不等于知识可抽取
- **[How Do LLMs Acquire Factual Knowledge During Pretraining?](https://arxiv.org/abs/2406.11813)**：事实知识通过多次 encounter 累积
- **[How do language models learn facts?](https://arxiv.org/abs/2503.21676)**：事实学习存在阶段性

持续学习含义：replay 的作用不仅是增加旧数据比例，也是控制旧知识的再暴露间隔。

----

## Circuit 与表示漂移

**[Knowledge Circuits in Pretrained Transformers](https://arxiv.org/abs/2405.17969)** 从 circuit 层面分析知识表达。

持续学习中需要关注：

- 知识分布在多个 attention head 和 MLP 组件中
- 新知识更新可能改变共享表示
- benchmark 保持不代表表示完全稳定
- fine-tuning、replay、editing 对表示的影响不同

----

## 从知识建模解释遗忘

新领域进入训练后，旧知识可能被削弱，原因包括：

| 机制 | 对应解释 |
|---|---|
| 频率变化 | 旧知识在训练分布中的有效比例下降 |
| 暴露间隔变长 | 旧知识缺少再暴露，保持强度下降 |
| 容量竞争 | 新知识占用有限参数或 circuit |
| 表示漂移 | 旧知识仍在参数中，但不易被原方式抽取 |

这说明遗忘不一定是旧知识完全消失，也可能是可访问性下降。

----

## 梯度冲突解释

新任务一步更新后，旧任务 loss 的一阶变化：

$$
\Delta L_{\mathrm{old}}
\approx
-\eta
\nabla_\theta L_{\mathrm{old}}^\top
\nabla_\theta L_{\mathrm{new}}.
$$

如果梯度点积为负，新任务更新会增加旧任务 loss。

代表工作：**[Gradient Episodic Memory for Continual Learning](https://arxiv.org/abs/1706.08840)**。

----

## 参数重要性与容量干扰

**[Overcoming catastrophic forgetting in neural networks](https://arxiv.org/abs/1612.00796)** 使用 Fisher 信息保护旧任务重要参数：

$$
\frac{\lambda}{2}\sum_i F_i(\theta_i-\theta_i^\star)^2.
$$

**[Why Larger Models Learn More: Effects of Capacity, Interference, and Rare-Task Retention](https://arxiv.org/abs/2605.29548)** 强调：

- 小模型更容易出现容量竞争
- 稀有任务更容易被高频任务更新覆盖
- 更大模型有更强的稀有任务保持能力

---

# 参考文献

----

## Scaling Laws and Data Mixing

<div class="refs-small">

- **[Scaling Laws for Neural Language Models](https://arxiv.org/abs/2001.08361)**, 2020
- **[Training Compute-Optimal Large Language Models](https://arxiv.org/abs/2203.15556)**, 2022
- **[DoReMi](https://arxiv.org/abs/2305.10429)**, 2023
- **[Data Mixing Laws](https://arxiv.org/abs/2403.16952)**, 2024/2025
- **[RegMix](https://arxiv.org/abs/2407.01492)**, 2024/2025
- **[Data Mixing Made Efficient](https://arxiv.org/abs/2405.14908)**, 2024
- **[InfoLaw](https://arxiv.org/abs/2605.02364)**, 2026

</div>

----

## Continual Pre-training

<div class="refs-small">

- **[Continual Learning of Large Language Models](https://arxiv.org/abs/2404.16789)**, 2024
- **[D-CPT Law](https://arxiv.org/abs/2406.01375)**, 2024
- **[CMR Scaling Law](https://arxiv.org/abs/2407.17467)**, 2024
- **[Learning Dynamics in Continual Pre-Training](https://arxiv.org/abs/2505.07796)**, 2025
- **[Simple and Scalable Strategies to Continually Pre-train LLMs](https://arxiv.org/abs/2403.08763)**, 2024
- **[Scaling Data-Constrained Language Models](https://arxiv.org/abs/2305.16264)**, 2023/2025
- **[Don’t Stop Pretraining](https://arxiv.org/abs/2004.10964)**, 2020

</div>

----

## Knowledge and Forgetting

<div class="refs-small">

- **[The Quantization Model of Neural Scaling](https://arxiv.org/abs/2303.13506)**, 2023
- **[Understanding LLM Behaviors via Compression](https://arxiv.org/abs/2504.09597)**, 2025
- **[Physics of Language Models: Part 3.1](https://arxiv.org/abs/2309.14316)**, 2023
- **[How Do LLMs Acquire Factual Knowledge During Pretraining?](https://arxiv.org/abs/2406.11813)**, 2024
- **[How do language models learn facts?](https://arxiv.org/abs/2503.21676)**, 2025
- **[Knowledge Circuits in Pretrained Transformers](https://arxiv.org/abs/2405.17969)**, 2024
- **[Why Larger Models Learn More](https://arxiv.org/abs/2605.29548)**, 2026

</div>

----

## Continual Learning Methods

<div class="refs-small">

- **[Gradient Episodic Memory](https://arxiv.org/abs/1706.08840)**, 2017
- **[Overcoming catastrophic forgetting](https://arxiv.org/abs/1612.00796)**, 2017
- **[Learning without Forgetting](https://arxiv.org/abs/1606.09282)**, 2016
- **[LAMOL](https://arxiv.org/abs/1909.03329)**, 2019
- **[Catastrophic Forgetting in LLM Continual Fine-tuning](https://arxiv.org/abs/2308.08747)**, 2023
- **[Self-Synthesized Rehearsal](https://arxiv.org/abs/2403.01244)**, 2024
- **[InsCL](https://arxiv.org/abs/2403.11435)**, 2024
- **[Self-Distillation Enables Continual Learning](https://arxiv.org/abs/2601.19897)**, 2026

</div>

---
layout: center
---

# 谢谢

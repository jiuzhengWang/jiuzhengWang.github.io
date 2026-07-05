---
theme: ./theme
title: "Scaling Laws for Data Mixing and Continual Pre-training"
author: 王九铮
themeConfig:
  primary: '#94070A'
transition: fade-out
drawings:
  persist: false
mdc: true
---

# Scaling Laws for Data Mixing and Continual Pre-training

<p class="pku-cover-author">王九铮</p>

<BrandImage class="pku-cover-emblem" src="brand/pku-emblem-red.png" />

---

## 汇报主线

本次汇报围绕 scaling law 在大模型预训练中的三类问题展开：

- 经典 scaling law：模型规模、数据规模、算力预算与验证 loss 的关系
- data mixing：当数据由多个来源构成时，混合比例如何进入建模
- continual pre-training：继续预训练中的领域收益与通用能力保持

<hr>

目标是明确这些工作的<red>变量、公式含义、适用边界和实验设计方式</red>。

---

# 规模规律与预算分配

----

## Scaling law 的基本对象

在预训练语境中，scaling law 通常描述：

$$
\text{controllable resources}
\quad \longrightarrow \quad
\text{validation loss or task metric}.
$$

常见自变量包括：

- 参数量 $N$
- 训练 tokens $D$
- 训练算力 $C$
- 数据混合比例 $r$
- 继续预训练进度 $t$

<hr>

<red>需要先确认横轴和纵轴，否则公式本身没有可解释性。</red>

----

## Kaplan: 分离式幂律

Kaplan et al. 将 $N,D,C$ 分别建模：

$$
L(N)=\left(\frac{N_c}{N}\right)^{\alpha_N},\quad
L(D)=\left(\frac{D_c}{D}\right)^{\alpha_D},\quad
L(C)=\left(\frac{C_c}{C}\right)^{\alpha_C}.
$$

含义：

- 在固定实验族中，扩大单个资源会带来近似幂律的 loss 下降
- log-log 坐标中，斜率对应幂律指数
- 可用于估计扩大规模后的收益

----

## 分离式建模的局限

如果训练算力近似满足：

$$
C \propto ND,
$$

那么在固定 $C$ 时，$N$ 和 $D$ 不能独立变化。

- 参数量增大通常意味着可训练 tokens 减少
- 模型变大可能导致 under-training
- 单独比较 $N$ 或 $D$ 会掩盖预算分配问题

<hr>

<red>核心限制：分离式公式不能直接回答 compute-optimal allocation。</red>

----

## Chinchilla: 联合建模 $N$ 和 $D$

Hoffmann et al. 使用联合形式：

$$
L(N,D)=E+\frac{A}{N^\alpha}+\frac{B}{D^\beta}.
$$

其中：

- $E$：不可约 loss
- $\frac{A}{N^\alpha}$：模型容量不足带来的损失
- $\frac{B}{D^\beta}$：训练数据不足带来的损失

<hr>

该公式直接刻画 $N$ 和 $D$ 的共同作用。

----

## 预算分配的结论

在固定算力下，compute-optimal training 不是单纯扩大模型。

更合适的表述是：

- 参数量和 tokens 需要共同扩展
- 过大的模型如果数据不足，可能不是最优解
- 实验应覆盖多个 $N,D$ 组合，而不是只报告单一规模点

<hr>

<red>经典 scaling law 的主要作用是指导预算分配，而不是证明某个模型规模本身最优。</red>

----

## 小结

经典 scaling law 提供了一个基础框架：

- 将资源投入与 loss 改善联系起来
- 用较小规模实验外推较大规模训练
- 分析模型规模和数据规模的相对瓶颈

<hr>

但它的纵轴通常是平均 loss。对于知识获取、数据来源和继续预训练，这个指标仍然不够。

---

# 数据分布与知识覆盖

----

## 平均 loss 之外的问题

平均 loss 可以衡量整体预测误差，但不直接回答：

- 某类事实知识是否被模型覆盖
- 低频知识是否跨过可学习阈值
- 不同数据来源对目标能力的边际贡献

<hr>

因此，data mixing 的问题不能只用总 tokens $D$ 表示。

----

## 知识频率与长尾覆盖

一种抽象方式是将知识单元按频率排序：

$$
p_k \propto k^{-s}.
$$

其中 $p_k$ 表示第 $k$ 个知识单元在训练分布中的出现频率。

含义：

- 高频知识更容易被覆盖
- 低频知识需要更多有效暴露
- 平均 loss 的平滑下降可能对应知识单元级别的阈值现象

----

## Data mixing 的变量

真实预训练数据通常来自多个来源：

$$
r=(r_1,\ldots,r_K),\quad
r_i\ge 0,\quad
\sum_i r_i=1.
$$

这里 $r_i$ 是第 $i$ 类数据的采样比例。

此时训练数据不再只是标量 $D$，而是：

$$
(D,r).
$$

<hr>

<red>数据规模决定训练量，混合比例决定训练分布。</red>

----

## 目标知识的有效暴露

设某类目标知识在来源中的出现概率为 $p$，该来源采样比例为 $r$。

有效暴露强度与 $rp$ 相关。一类阈值形式可写为：

$$
M_{\mathrm{thres}}
\sim
\left(\frac{1}{rp}\right)^{1/(\alpha+1)}.
$$

含义：

- 当 $r$ 很低时，目标知识需要更大规模才可能被学习
- 提高来源比例会降低所需规模阈值
- 目标知识的频率和来源比例都影响知识获取

----

## 训练分布与自然分布

最优训练分布未必等于数据的自然分布。

一类理论结果给出：

$$
q_i^\star \propto p_i^{1/(\alpha+1)}.
$$

当 $1/(\alpha+1)<1$ 时：

- 高频来源的权重相对降低
- 低频来源的权重相对提高
- 训练分布比自然分布更均衡

<hr>

<red>数据配比可以被视为优化变量，而不是固定的数据描述。</red>

----

## 方法谱系

| 方法 | 建模对象 | 输出 |
|---|---:|---:|
| DoReMi | proxy model 上的 domain loss | 域权重 |
| Data Mixing Laws | 混合比例与 loss | ratio-loss 曲线 |
| RegMix / BiMix | 多域混合回归 | 预算下的比例选择 |
| InfoLaw | 有效信息量 | 知识覆盖与重复收益 |

<hr>

共同目标是用小规模实验或代理模型估计不同来源的边际收益。

----

## 小结

data mixing 将 scaling law 的变量从 $D$ 扩展为 $(D,r)$。

需要同时考虑：

- 数据来源的规模
- 数据来源的质量
- 目标知识在来源中的频率
- 不同来源之间的权衡

<hr>

<red>这一层问题的核心是训练分布，而不是单纯的数据总量。</red>

---

# 继续预训练中的收益与遗忘

----

## CPT 与从零预训练的差别

从零预训练：

$$
\theta_{\mathrm{random}} \rightarrow \theta_{\mathrm{pretrain}}.
$$

继续预训练：

$$
\theta_0 \rightarrow \theta_{\mathrm{CPT}}.
$$

差别在于 $\theta_0$ 已经包含通用能力。

因此 CPT 需要同时评估：

- 领域能力提升
- 通用能力保持
- 指令遵循和输出格式稳定性

----

## 不能只报告领域指标

仅报告 domain benchmark 可能不足以判断 CPT 是否有效。

需要同时观察：

- domain validation loss
- general validation loss
- general benchmark
- instruction following
- reasoning / reading comprehension

<hr>

<red>CPT 的评价目标天然是多目标的。</red>

----

## 遗忘的梯度解释

新任务一步更新后，旧任务 loss 的一阶变化近似为：

$$
\Delta L_{\mathrm{old}}
\approx
-\eta
\nabla_\theta L_{\mathrm{old}}^\top
\nabla_\theta L_{\mathrm{new}}.
$$

如果梯度点积为负，新任务更新会增加旧任务 loss。

这解释了 replay、regularization、gradient projection 等方法的共同动机：

- 保留旧任务约束
- 限制参数移动
- 减少任务间梯度冲突

----

## D-CPT Law

一种代表性形式将领域比例 $r$ 放入公式：

$$
L(N,D,r)
=
E+\frac{A}{N^\alpha}
+\frac{B r^\eta}{D^\beta}
+\frac{C}{(r+\epsilon)^\gamma}.
$$

其中：

- $N$：模型规模
- $D$：CPT tokens
- $r$：领域数据比例

该公式用于估计达到目标领域 loss 所需的数据规模和混合比例。

----

## 临界混合比例

CMR scaling law 关注领域数据比例的临界点：

$$
R_{\mathrm{CMR}} = aT^s + b.
$$

其中 $T$ 是 CPT tokens，$R_{\mathrm{CMR}}$ 是 critical mixture ratio。

含义：

- 领域比例过低时，领域收益有限
- 领域比例过高时，通用能力退化风险增加
- 最优比例依赖训练时长和数据组成

----

## 训练阶段的影响

CPT 的过程也需要建模。

常见现象包括：

- 早期存在迁移收益
- 中期领域 loss 明显下降
- 后期通用能力退化风险增加

因此实验中应报告多个 checkpoint，而不是只报告最终模型。

<hr>

<red>训练阶段 $t$ 本身也是 CPT scaling law 中的重要变量。</red>

----

## 小结

CPT scaling law 需要同时建模：

- 模型规模 $N$
- CPT tokens $D$
- 领域数据比例 $r$
- 训练阶段 $t$
- domain/general 两类指标

<hr>

与从零预训练相比，CPT 的核心约束是领域收益与已有能力保持之间的权衡。

---

# 实验设计与结果汇报

----

## 最小实验矩阵

| 实验轴 | 建议设置 | 目的 |
|---|---:|---|
| model size | 2-3 个 scale | 估计外推斜率 |
| total tokens | 2-3 个预算 | 区分容量瓶颈与数据瓶颈 |
| mix ratio | 4-6 个比例 | 观察阈值和拐点 |
| checkpoint | 多个阶段 | 分析收益与遗忘动态 |
| eval set | domain + general | 评估 trade-off |

<hr>

实验点的设计应服务于拟合和外推，而不只是报告单次训练结果。

----

## 拟合与外推的边界

报告 scaling law 时，需要明确：

- 模型架构和 tokenizer 是否一致
- 数据去重与 contamination 处理
- optimizer、learning rate schedule 和 batch size
- proxy model 与目标模型之间的差异
- held-out evaluation 是否覆盖目标能力

<hr>

<red>缺少边界条件时，scaling law 不能可靠用于预算决策。</red>

----

## 结果呈现建议

结果不应只给最终表格。

更有信息量的呈现包括：

- loss vs. scale 曲线
- loss vs. mixture ratio 曲线
- domain/general 指标随 checkpoint 的变化
- 不同数据来源的边际收益
- 外推点与实际训练点的误差

<hr>

这样可以判断公式是在解释现有结果，还是确实具有预测能力。

----

## 总结

本次汇报的结论：

- 经典 scaling law 主要解决规模扩展和预算分配问题
- data mixing 将变量从数据总量扩展到数据分布
- CPT scaling law 需要同时考虑领域收益和通用能力保持
- 实验设计应围绕可拟合、可外推、可验证的曲线展开

<hr>

<red>后续预训练决策应同时回答：训练多少、采样什么、按什么比例、何时停止。</red>

----

## 参考文献

- Kaplan et al., *Scaling Laws for Neural Language Models*, 2020.
- Hoffmann et al., *Training Compute-Optimal Large Language Models*, 2022.
- Michaud et al., *The Quantization Model of Neural Scaling*, 2023.
- Data mixing / domain reweighting: DoReMi, RegMix, Data Mixing Laws.
- Continual learning: GEM, EWC, replay, gradient projection.
- Continual pre-training: D-CPT Law, CMR Scaling Law, Learning Dynamics in CPT.

---
layout: center
---

# 谢谢

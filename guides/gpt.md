┌──────────────────────────────────────────────────────────────────────────────┐
│                                  TRANSFORMER LM                               │
│                  (autoregressive, causal; next-token prediction)              │
└──────────────────────────────────────────────────────────────────────────────┘

Legend / dimensions
───────────────────────────────────────────────────────────────────────────────
C       = context length (#tokens in sequence)
V       = vocab size
D       = model width (embedding dim)
H       = #attention heads
d_head  = D / H
L       = #transformer blocks (layers)

All tensors are batched in practice: (B, C, D). Below omits batch for clarity.

───────────────────────────────────────────────────────────────────────────────
(1) INPUT TEXT  (Unicode / UTF-8 byte stream, up to C tokens)
───────────────────────────────────────────────────────────────────────────────
┌──────────────────────────────────────────────────────────────────────────────┐
│  INPUT TEXT                                                                    │
└──────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
───────────────────────────────────────────────────────────────────────────────
(2) TOKENIZATION (BPE)  → token IDs in [0..V-1]
───────────────────────────────────────────────────────────────────────────────
┌──────────────────────────────────────────────────────────────────────────────┐
│  BYTE-PAIR ENCODER (BPE tokenizer)                                            │
│  input: text                                                                  │
│  output: token_ids = [t0, t1, ... t(C-1)]                                     │
│  shape: (C,)                                                                  │
└──────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
───────────────────────────────────────────────────────────────────────────────
(3) TOKEN EMBEDDINGS  (lookup in vocab table)
───────────────────────────────────────────────────────────────────────────────
┌──────────────────────────────────────────────────────────────────────────────┐
│  TOKEN EMBEDDINGS                                                             │
│  E_tok: (V, D)                                                                │
│  embed_i = E_tok[token_i]                                                     │
│  embeds: (C, D)                                                               │
└──────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
───────────────────────────────────────────────────────────────────────────────
(4) POSITION EMBEDDINGS  (learned lookup by position)
───────────────────────────────────────────────────────────────────────────────
┌──────────────────────────────────────────────────────────────────────────────┐
│  LEARNED POSITIONAL EMBEDDINGS                                                │
│  E_pos: (C, D)                                                                │
│  pos_i = E_pos[i],  i = 0..C-1                                                │
│  pos: (C, D)                                                                  │
└──────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
───────────────────────────────────────────────────────────────────────────────
(5) INPUT REPRESENTATION (sum)
───────────────────────────────────────────────────────────────────────────────
┌──────────────────────────────────────────────────────────────────────────────┐
│  INPUT REPRESENTATION SUM                                                     │
│  h^0_i = embed_i + pos_i                                                      │
│  h^0: (C, D)                                                                  │
└──────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼

┌──────────────────────────────────────────────────────────────────────────────┐
│                     (6) STACK OF L TRANSFORMER BLOCKS                         │
│                 repeated L times (same structure, different params)           │
└──────────────────────────────────────────────────────────────────────────────┘

================================================================================
TRANSFORMER BLOCK ℓ   (ℓ = 0..L-1)   [Pre-Norm; RMSNorm; Residual paths]
================================================================================

Input to block:
  h^ℓ : (C, D)

┌──────────────────────────────────────────────────────────────────────────────┐
│                              BLOCK ℓ                                          │
│                                                                              │
│  ┌────────────────────────────────────────────────────────────────────────┐  │
│  │ (A) PRE-NORM 1  (RMSNorm / LayerNorm variant)                           │  │
│  │   n^ℓ = LN(h^ℓ)                                                          │  │
│  │   shapes: h^ℓ (C, D)  →  n^ℓ (C, D)                                      │  │
│  └────────────────────────────────────────────────────────────────────────┘  │
│                                 │                                            │
│                                 ▼                                            │
│  ┌────────────────────────────────────────────────────────────────────────┐  │
│  │ (B) MULTI-QUERY (or multi-head) CAUSAL SELF-ATTENTION                   │  │
│  │                                                                          │  │
│  │   Projections:                                                          │  │
│  │     Q = n^ℓ @ W_Q              → (C, D) then reshape → (C, H, d_head)     │  │
│  │     K = n^ℓ @ W_K              → (C, d_head)  [shared across heads]       │  │
│  │     V = n^ℓ @ W_V              → (C, d_head)  [shared across heads]       │  │
│  │                                                                          │  │
│  │   Causal mask: only attend to positions j ≤ i                            │  │
│  │                                                                          │  │
│  │   For each head h:                                                       │  │
│  │     attn_scores[i,j,h] = (Q[i,h] · K[j]) / sqrt(d_head)                   │  │
│  │     attn_weights = softmax(mask(attn_scores))                             │  │
│  │     head_out[i,h] = Σ_j attn_weights[i,j,h] * V[j]                        │  │
│  │                                                                          │  │
│  │   Concatenate heads:                                                     │  │
│  │     HeadOut: (C, H, d_head) → concat → (C, D)                             │  │
│  │                                                                          │  │
│  │   Output projection (typical):                                           │  │
│  │     AttnOut = concat(HeadOut) @ W_O  → (C, D)                             │  │
│  │                                                                          │  │
│  └────────────────────────────────────────────────────────────────────────┘  │
│                                 │                                            │
│                                 ▼                                            │
│  ┌────────────────────────────────────────────────────────────────────────┐  │
│  │ (C) RESIDUAL ADD (post-attention)                                       │  │
│  │   h_attn^ℓ = h^ℓ + AttnOut                                              │  │
│  │   shapes: (C, D) + (C, D) → (C, D)                                      │  │
│  └────────────────────────────────────────────────────────────────────────┘  │
│                                 │                                            │
│                                 ▼                                            │
│  ┌────────────────────────────────────────────────────────────────────────┐  │
│  │ (D) PRE-NORM 2  (RMSNorm / LayerNorm variant)                           │  │
│  │   n2^ℓ = LN(h_attn^ℓ)                                                    │  │
│  │   shapes: (C, D) → (C, D)                                               │  │
│  └────────────────────────────────────────────────────────────────────────┘  │
│                                 │                                            │
│                                 ▼                                            │
│  ┌────────────────────────────────────────────────────────────────────────┐  │
│  │ (E) FEED-FORWARD NETWORK (FFN / MLP)                                     │  │
│  │                                                                          │  │
│  │   Linear 1 (expand):                                                     │  │
│  │     u = n2^ℓ @ W1 + b1         → (C, 4D)                                  │  │
│  │                                                                          │  │
│  │   Activation:                                                            │  │
│  │     a = GELU(u)                → (C, 4D)                                  │  │
│  │                                                                          │  │
│  │   Linear 2 (project back):                                               │  │
│  │     FFNOut = a @ W2 + b2        → (C, D)                                   │  │
│  │                                                                          │  │
│  └────────────────────────────────────────────────────────────────────────┘  │
│                                 │                                            │
│                                 ▼                                            │
│  ┌────────────────────────────────────────────────────────────────────────┐  │
│  │ (F) RESIDUAL ADD (post-FFN)                                             │  │
│  │   h^(ℓ+1) = h_attn^ℓ + FFNOut                                           │  │
│  │   shapes: (C, D) + (C, D) → (C, D)                                      │  │
│  └────────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘

Output of block:
  h^(ℓ+1) : (C, D)

================================================================================
END STACK (after L blocks)
================================================================================

                                      │
                                      ▼
───────────────────────────────────────────────────────────────────────────────
(7) FINAL PRE-NORM (often RMSNorm)
───────────────────────────────────────────────────────────────────────────────
┌──────────────────────────────────────────────────────────────────────────────┐
│  FINAL NORM                                                                    │
│  h^L_norm = LN(h^L)                                                            │
│  shape: (C, D)                                                                 │
└──────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
───────────────────────────────────────────────────────────────────────────────
(8) OUTPUT PROJECTION → LOGITS OVER VOCAB
───────────────────────────────────────────────────────────────────────────────
┌──────────────────────────────────────────────────────────────────────────────┐
│  OUTPUT PROJECTION (LM HEAD)                                                  │
│  logits = h^L_norm @ W_out + b_out                                             │
│  W_out: (D, V)                                                                 │
│  logits shape: (C, V)                                                         │
└──────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
───────────────────────────────────────────────────────────────────────────────
(9) SOFTMAX (optionally temperature τ)
───────────────────────────────────────────────────────────────────────────────
┌──────────────────────────────────────────────────────────────────────────────┐
│  PROBABILITIES                                                                 │
│  p_i = softmax(logits_i / τ)                                                   │
│  for each position i (typically we use only i = C-1 for next token)            │
│  shape: (C, V)                                                                 │
└──────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
───────────────────────────────────────────────────────────────────────────────
(10) SAMPLE / SELECT NEXT TOKEN  → DETOKENIZE
───────────────────────────────────────────────────────────────────────────────
┌──────────────────────────────────────────────────────────────────────────────┐
│  DECODING                                                                      │
│  choose next_token from p_(C-1):                                               │
│   - argmax (greedy)                                                           │
│   - top-k                                                                     │
│   - nucleus / top-p                                                           │
│   - etc.                                                                      │
│  append token, shift/extend context, repeat loop                              │
│                                                                              │
│  DETOKENIZE: token IDs → UTF-8 text                                            │
└──────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│  GENERATED TEXT                                                                │
└──────────────────────────────────────────────────────────────────────────────┘

'''markdown


Task:
  Description : "rpt6 repo — full folder structure (monorepo)"
Objective:
  "Provide a complete, scalable folder tree for a GPT-6-ready LLM product platform (UI + gateway + router + tools + RAG + evals + training + infra)."
Results:
  "End-to-end directory layout with key files/placeholders."

rpt6/
├─ README.md
├─ LICENSE
├─ CONTRIBUTING.md
├─ CODEOWNERS
├─ SECURITY.md
├─ .gitignore
├─ .gitattributes
├─ .editorconfig
├─ .env.example
├─ package.json
├─ pnpm-workspace.yaml
├─ turbo.json
├─ tsconfig.base.json
├─ pyproject.toml
├─ uv.lock / poetry.lock
├─ Makefile
├─ docker-compose.yml
├─ docker/
│  ├─ gateway.Dockerfile
│  ├─ worker.Dockerfile
│  ├─ web.Dockerfile
│  └─ dev.Dockerfile
├─ scripts/
│  ├─ bootstrap.sh
│  ├─ dev.sh
│  ├─ lint.sh
│  ├─ fmt.sh
│  ├─ test.sh
│  ├─ release.sh
│  ├─ seed_demo_data.py
│  └─ gen_openapi.sh
├─ docs/
│  ├─ architecture.md
│  ├─ api.md
│  ├─ deployment.md
│  ├─ observability.md
│  ├─ safety.md
│  ├─ evals.md
│  ├─ rag.md
│  ├─ data_governance.md
│  ├─ runbooks/
│  │  ├─ incident.md
│  │  ├─ rollback.md
│  │  └─ abuse_response.md
│  └─ adr/
│     ├─ 0001-monorepo.md
│     └─ 0002-streaming-sse.md
├─ .github/
│  ├─ workflows/
│  │  ├─ ci.yml
│  │  ├─ cd.yml
│  │  ├─ security.yml
│  │  └─ eval-gate.yml
│  ├─ dependabot.yml
│  └─ ISSUE_TEMPLATE/
│     ├─ bug.md
│     └─ feature.md
├─ apps/
│  ├─ web/
│  │  ├─ package.json
│  │  ├─ next.config.js
│  │  ├─ app/
│  │  │  ├─ layout.tsx
│  │  │  ├─ page.tsx
│  │  │  ├─ chat/page.tsx
│  │  │  ├─ settings/page.tsx
│  │  │  └─ api/health/route.ts
│  │  ├─ components/
│  │  ├─ styles/
│  │  ├─ public/
│  │  └─ tests/
│  │     └─ e2e/
│  ├─ gateway/
│  │  ├─ pyproject.toml
│  │  ├─ README.md
│  │  └─ src/
│  │     └─ gateway/
│  │        ├─ __init__.py
│  │        ├─ main.py                  # FastAPI entry
│  │        ├─ api/
│  │        │  ├─ v1_chat.py
│  │        │  ├─ v1_embeddings.py
│  │        │  └─ health.py
│  │        ├─ auth/
│  │        │  ├─ api_keys.py
│  │        │  └─ jwt.py
│  │        ├─ middleware/
│  │        │  ├─ request_id.py
│  │        │  ├─ rate_limit.py
│  │        │  ├─ cors.py
│  │        │  └─ logging.py
│  │        ├─ orchestration/
│  │        │  ├─ planner.py
│  │        │  ├─ tool_runner.py
│  │        │  └─ streaming.py
│  │        ├─ config/
│  │        │  ├─ settings.py
│  │        │  └─ feature_flags.py
│  │        └─ telemetry/
│  │           ├─ otel.py
│  │           └─ metrics.py
│  ├─ worker/
│  │  ├─ pyproject.toml
│  │  └─ src/worker/
│  │     ├─ main.py                     # queue consumer
│  │     └─ jobs/
│  │        ├─ embeddings_job.py
│  │        ├─ eval_job.py
│  │        └─ ingest_job.py
│  └─ admin/
│     ├─ package.json
│     └─ src/
│        └─ index.tsx                   # internal dashboard (optional)
├─ packages/
│  ├─ sdk-ts/
│  │  ├─ package.json
│  │  ├─ src/
│  │  │  ├─ index.ts
│  │  │  ├─ client.ts
│  │  │  ├─ streaming.ts
│  │  │  └─ types.ts
│  │  └─ tests/
│  ├─ sdk-py/
│  │  ├─ pyproject.toml
│  │  └─ src/gpt6_sdk/
│  │     ├─ __init__.py
│  │     ├─ client.py
│  │     ├─ streaming.py
│  │     └─ types.py
│  ├─ promptkit/
│  │  ├─ package.json
│  │  └─ src/
│  │     ├─ templates/
│  │     │  ├─ system_default.md
│  │     │  ├─ system_tools.md
│  │     │  └─ safety_preamble.md
│  │     ├─ render.ts
│  │     └─ redaction.ts
│  ├─ policies/
│  │  ├─ package.json
│  │  └─ src/
│  │     ├─ routing/
│  │     │  ├─ policy.ts
│  │     │  ├─ cost_latency.ts
│  │     │  └─ canary.ts
│  │     ├─ safety/
│  │     │  ├─ input_filter.ts
│  │     │  ├─ output_filter.ts
│  │     │  └─ allowlists.ts
│  │     └─ tenancy/
│  │        ├─ quotas.ts
│  │        └─ entitlements.ts
│  ├─ evals/
│  │  ├─ pyproject.toml
│  │  ├─ src/evals/
│  │  │  ├─ harness.py
│  │  │  ├─ metrics.py
│  │  │  ├─ suites/
│  │  │  │  ├─ coding.yaml
│  │  │  │  ├─ reasoning.yaml
│  │  │  │  ├─ safety.yaml
│  │  │  │  └─ tooluse.yaml
│  │  │  └─ reporters/
│  │  │     ├─ jsonl.py
│  │  │     └─ dashboard.py
│  │  └─ datasets/
│  │     ├─ README.md
│  │     └─ manifests/
│  │        ├─ public.yaml
│  │        └─ internal.yaml
│  └─ ui-kit/
│     ├─ package.json
│     └─ src/
│        ├─ components/
│        └─ theme/
├─ services/
│  ├─ router/
│  │  ├─ pyproject.toml
│  │  └─ src/router/
│  │     ├─ __init__.py
│  │     ├─ providers/
│  │     │  ├─ base.py
│  │     │  ├─ local_stub.py
│  │     │  ├─ openai.py
│  │     │  ├─ anthropic.py
│  │     │  └─ vllm.py
│  │     ├─ routing/
│  │     │  ├─ decision.py
│  │     │  ├─ fallback.py
│  │     │  └─ canary.py
│  │     └─ cache/
│  │        ├─ semantic.py
│  │        └─ response.py
│  ├─ tools/
│  │  ├─ pyproject.toml
│  │  └─ src/tools/
│  │     ├─ registry.py
│  │     ├─ schemas/
│  │     │  ├─ http.json
│  │     │  ├─ calculator.json
│  │     │  └─ rag.json
│  │     ├─ sandboxes/
│  │     │  ├─ http_client.py
│  │     │  ├─ filesystem.py
│  │     │  └─ subprocess.py
│  │     └─ policies/
│  │        ├─ allowlist.py
│  │        └─ timeouts.py
│  ├─ rag/
│  │  ├─ pyproject.toml
│  │  └─ src/rag/
│  │     ├─ ingest/
│  │     │  ├─ loaders.py
│  │     │  ├─ chunking.py
│  │     │  └─ dedupe.py
│  │     ├─ embed/
│  │     │  ├─ embedder.py
│  │     │  └─ providers.py
│  │     ├─ index/
│  │     │  ├─ vector_store.py
│  │     │  └─ migrations/
│  │     └─ retrieve/
│  │        ├─ retriever.py
│  │        └─ rerank.py
│  ├─ telemetry/
│  │  ├─ pyproject.toml
│  │  └─ src/telemetry/
│  │     ├─ tracing.py
│  │     ├─ logging.py
│  │     └─ dashboards/
│  └─ safety/
│     ├─ pyproject.toml
│     └─ src/safety/
│        ├─ classifiers/
│        │  ├─ fast_text.py
│        │  ├─ rules.py
│        │  └─ llm_judge.py
│        ├─ redaction/
│        │  ├─ pii.py
│        │  └─ secrets.py
│        └─ enforcement/
│           ├─ decision.py
│           └─ audit.py
├─ training/
│  ├─ README.md
│  ├─ data/
│  │  ├─ ingest/
│  │  ├─ cleaners/
│  │  ├─ filters/
│  │  └─ manifests/
│  ├─ sft/
│  │  ├─ configs/
│  │  └─ run_sft.py
│  ├─ preference/
│  │  ├─ dpo/
│  │  └─ rlhf/
│  ├─ safety_ft/
│  │  └─ run_safety_ft.py
│  └─ distill/
│     └─ run_distill.py
├─ infra/
│  ├─ k8s/
│  │  ├─ namespaces.yaml
│  │  ├─ gateway-deployment.yaml
│  │  ├─ web-deployment.yaml
│  │  ├─ worker-deployment.yaml
│  │  ├─ router-deployment.yaml
│  │  ├─ ingress.yaml
│  │  ├─ hpa.yaml
│  │  └─ secrets.example.yaml
│  ├─ terraform/
│  │  ├─ main.tf
│  │  ├─ variables.tf
│  │  ├─ outputs.tf
│  │  └─ modules/
│  │     ├─ vpc/
│  │     ├─ redis/
│  │     ├─ postgres/
│  │     └─ object_store/
│  └─ helm/
│     └─ gpt6/
│        ├─ Chart.yaml
│        ├─ values.yaml
│        └─ templates/
├─ configs/
│  ├─ tenants/
│  │  ├─ default.yaml
│  │  └─ enterprise.yaml
│  ├─ models/
│  │  ├─ providers.yaml
│  │  └─ routing.yaml
│  └─ safety/
│     ├─ policies.yaml
│     └─ allowlists.yaml
├─ data/
│  ├─ samples/
│  └─ fixtures/
├─ logs/
│  └─ .gitkeep
└─ tests/
   ├─ integration/
   ├─ load/
   ├─ security/
   └─ golden/
      ├─ prompts/
      └─ outputs/'''

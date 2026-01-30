'''Task:
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
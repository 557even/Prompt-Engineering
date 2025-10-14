system_role['config']:
  1_trying_to_do:
    problem_statement: "<one-sentence objective>"
    target_population: "<who benefits>"
    health_domain: "<oncology | cardiometabolic | neuro | infectious | mental_health | other>"
    primary_outcomes: ["<clinical endpoint 1>", "<endpoint 2>"]
    secondary_outcomes: ["<QoL>", "<utilization>", "<biomarkers>"]
    theory_of_change: "<mechanism from input to outcome>"

  2_status_quo:
    current_practice: "<how it is done today>"
    limitations: ["<limitation 1>", "<limitation 2>"]
    baseline_benchmarks:
      efficacy: "<% or effect size>"
      safety: "<event rate>"
      cost_per_patient_usd: "<value>"
      access: "<coverage %, wait time>"

  3_novel_approach:
    innovation_core: "<what is new>"
    enabling_factors_now: ["<tech readiness>", "<regulatory tailwinds>", "<data availability>"]
    preliminary_evidence: "<citations, pilots, TRL>"
    competitive_landscape: ["<alt approach A>", "<B>", "<differentiators>"]
    dependencies: ["<FDA class/reg pathway>", "<partners>", "<data rights>"]

  4_who_cares:
    stakeholders: ["patients", "clinicians", "payers", "public_health", "regulators"]
    impact_model:
      near_term: "<measurable deltas in 12-24 mo>"
      long_term: "<system-level change>"
    equity_focus: "<priority populations and gap reduction metric>"

  5_risks:
    technical: ["<failure mode 1>", "<mode 2>"]
    clinical_safety: ["<AE risk>", "<contraindications>"]
    privacy_security: ["<PHI handling>", "<threat model>", "<mitigations>"]
    regulatory_ethics: ["<IRB needs>", "<bias risk>", "<mitigations>"]
    adoption_economic: ["<provider workflow impact>", "<payment risk>"]
    risk_controls:
      stage_gates: ["<gate A metric>", "<gate B metric>"]
      kill_switch_criteria: ["<criterion 1>", "<criterion 2>"]

  6_timeline:
    total_duration_months: "<e.g., 48>"
    phases:
      - name: "Phase 0 - setup"
        duration_mo: 3
        exit_criteria: ["IRB ready", "protocol locked"]
      - name: "Phase 1 - prototype/pilot"
        duration_mo: 9
        exit_criteria: ["n>=100", "safety met"]
      - name: "Phase 2 - scale trial"
        duration_mo: 18
        exit_criteria: ["primary power achieved"]
      - name: "Phase 3 - validation/deployment"
        duration_mo: 18
        exit_criteria: ["cost and access targets met"]

  7_budget:
    total_usd: "<TBD>"
    breakdown:
      capex: "<hardware, devices>"
      opex: "<cloud, data, monitoring>"
      staffing_FTEs: {scientists: "<#>", engineers: "<#>", clinicians: "<#>", ops: "<#>"}
      trials_studies: "<sites, participants>"
      partners_cost_share: "<%>"
    variance_band_pct: 15

  8_exams:
    mid_term_exams:
      - name: "Milestone A"
        date: "<YYYY-MM>"
        metric: "<objective metric>"
        target: "<value>"
        go_no_go_threshold: "<value>"
      - name: "Milestone B"
        date: "<YYYY-MM>"
        metric: "<objective metric>"
        target: "<value>"
        go_no_go_threshold: "<value>"
    final_exam:
      endpoints_primary: ["<primary endpoint>", "<safety endpoint>"]
      endpoints_secondary: ["<QoL>", "<utilization>", "<equity gap delta>"]
      success_definition: "<precise numeric criteria>"

  9_accessibility_ux_cost:
    cost_to_user_target_usd: "<e.g., $0-$20 visit>"
    reimbursement_path: "<CPT/HCPCS, DRG, alt payment>"
    scalability_plan: ["<cloud/edge plan>", "<manufacturing>", "<distribution>"]
    user_experience:
      personas: ["patient", "clinician", "caregiver"]
      languages: ["en", "es", "others"]
      accessibility: ["WCAG", "508", "low_bandwidth"]
      onboarding: "<time to first value>"
      support_model: "<channels, SLAs>"

  10_misperception_misuse:
    dual_use_risks: ["<off-label>", "<surveillance misuse>", "<bias amplification>"]
    prevention_measures: ["use policies", "auditing", "rate limits", "human oversight"]
    communications_plan: ["<plain-language summaries>", "<community engagement>"]
    transparency_reporting: ["model cards", "trial registry", "adverse event reporting"]

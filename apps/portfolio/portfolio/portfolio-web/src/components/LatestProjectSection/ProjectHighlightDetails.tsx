function AiOrchestratedWorkflowDetail() {
  return (
    <>
      <p>
        Signal Tracker was built with an AI-assisted development workflow
        designed to make product planning, implementation, and documentation
        reinforce each other instead of drifting apart.
      </p>
      <h4>Workflow responsibilities</h4>
      <ul>
        <li>
          <strong>Google Drive</strong> stores durable product direction:
          <ul>
            <li>Project Charter</li>
            <li>Product Requirements Document</li>
            <li>Project Tracker</li>
            <li>Product Decisions Log</li>
            <li>Domain Glossary and Data Model ADR</li>
            <li>Validation Plan</li>
          </ul>
        </li>
        <li>
          <strong>GitHub Issues</strong> store build-ready feature
          specifications.
        </li>
        <li>
          <strong>GitHub Project</strong> tracks execution status.
        </li>
        <li>
          <strong>Codex</strong> works from bounded GitHub issues, repo-local
          instructions, and current code context.
        </li>
        <li>
          <strong>ChatGPT</strong> helps maintain product docs, decompose work,
          create issue specs, and identify implementation changes that should be
          reflected back into documentation.
        </li>
      </ul>
      <p>
        This creates a human-directed AI workflow rather than an autonomous
        &quot;AI writes the app&quot; workflow. AI is used as a structured
        product and engineering partner, while durable decisions remain explicit
        and reviewable.
      </p>
      <h4>Repo-local operating rules</h4>
      <p>
        The repo reinforces the workflow through <code>AGENTS.md</code> files
        that define where Signal Tracker code lives, which packages are in
        scope, which docs are authoritative, what is in or out of the MVP, how
        Codex should navigate the monorepo, and when implementation decisions
        need to be copied back into product docs.
      </p>
      <h4>Key points</h4>
      <ul>
        <li>ChatGPT supports product planning and documentation.</li>
        <li>Codex supports implementation against GitHub Issues.</li>
        <li>Google Drive remains the durable product source of truth.</li>
        <li>GitHub Issues hold build-ready specs.</li>
        <li>
          Repo-local agent instructions reduce ambiguity for AI-assisted
          implementation.
        </li>
        <li>
          Durable decisions discovered during implementation are routed back
          into docs.
        </li>
        <li>
          The workflow is designed for speed without giving up human judgment or
          architectural control.
        </li>
      </ul>
    </>
  );
}

function FullStackContractsDetail() {
  return (
    <>
      <p>
        Signal Tracker uses a shared contract layer to reduce duplicate API
        definitions across the stack. Instead of separately defining request
        types, response types, route paths, frontend client shapes, and backend
        validation logic, the app centralizes those concepts in{" "}
        <code>signal-tracker-shared</code>.
      </p>
      <h4>Shared package ownership</h4>
      <ul>
        <li>route names</li>
        <li>route paths</li>
        <li>request schemas</li>
        <li>response schemas</li>
        <li>inferred TypeScript types</li>
        <li>route contract metadata</li>
      </ul>
      <p>
        The core idea is simple: define the shape once, reuse it everywhere.
        This is more than normal code reuse; it is reuse across architectural
        boundaries.
      </p>
      <h4>Where the contracts show up</h4>
      <ul>
        <li>frontend request construction</li>
        <li>frontend response parsing</li>
        <li>backend route validation</li>
        <li>TypeScript request and response types</li>
        <li>infrastructure route registration</li>
        <li>Codex-readable implementation contracts</li>
      </ul>
      <p>
        The shared route list is also used by infrastructure code to generate
        API Gateway routes, so the same route registry helps drive both
        application behavior and deployment configuration.
      </p>
      <h4>API surface covered</h4>
      <ul>
        <li>
          topic creation, reading, listing, updating, archiving, and deletion
        </li>
        <li>event entry creation, reading, listing, and updating</li>
        <li>assessment update creation</li>
        <li>review note creation, reading, and listing</li>
        <li>topic timeline listing</li>
        <li>evidence item creation, capture, reading, and listing</li>
        <li>evidence anchor creation, reading, and listing</li>
        <li>citation attach, detach, and list behavior</li>
        <li>entry source replacement</li>
        <li>health checks</li>
      </ul>
      <h4>Key points</h4>
      <ul>
        <li>
          <code>signal-tracker-shared</code> owns project-scoped contracts,
          schemas, and shared types.
        </li>
        <li>Zod schemas define request and response validation.</li>
        <li>
          TypeScript types are inferred from schemas rather than manually
          duplicated.
        </li>
        <li>
          Frontend route helpers build requests and parse responses through
          shared contracts.
        </li>
        <li>
          Infrastructure can use the shared route list to register API routes.
        </li>
        <li>
          The pattern reduces API drift and makes Codex implementation tasks
          more deterministic.
        </li>
      </ul>
    </>
  );
}

function FrontendPlatformDetail() {
  return (
    <>
      <p>
        Signal Tracker&apos;s frontend is designed as a small app-specific
        frontend platform, not a collection of one-off React screens.
      </p>
      <h4>Layered frontend architecture</h4>
      <ul>
        <li>
          <strong>React/Vite</strong> for the application foundation.
        </li>
        <li>
          <strong>Tailwind CSS</strong> for styling, spacing, responsive layout,
          and design-token-driven visual control.
        </li>
        <li>
          <strong>shadcn/ui-style local primitives</strong> for common UI
          components.
        </li>
        <li>
          <strong>Radix UI</strong> as the primitive layer underneath
          interactions where needed.
        </li>
        <li>
          <strong>
            <code>@repo/dashboard-ui</code>
          </strong>{" "}
          for extracted dashboard primitives and styles.
        </li>
        <li>
          <strong>
            <code>@repo/ui-base</code>
          </strong>{" "}
          for shared behavior abstractions.
        </li>
        <li>
          <strong>RTK Query</strong> for server state.
        </li>
        <li>
          <strong>React Hook Form and Zod</strong> for schema-driven forms.
        </li>
        <li>
          <strong>Storybook</strong> for UI development and documentation.
        </li>
      </ul>
      <p>
        The &quot;Bone-DRY&quot; idea here is about avoiding duplicate frontend
        behavior. Loading states, form wiring, route-aware navigation,
        responsive behavior, and API state management are pushed into reusable
        layers instead of being solved differently on every screen.
      </p>
      <h4>Frontend boundaries</h4>
      <ul>
        <li>Generic UI primitives stay product-agnostic.</li>
        <li>Signal Tracker-specific components stay app-local.</li>
        <li>
          Dashboard primitives can live in <code>@repo/dashboard-ui</code>.
        </li>
        <li>
          Behavior abstractions can move to <code>@repo/ui-base</code>.
        </li>
        <li>
          API endpoint definitions and product workflows stay in the Signal
          Tracker web app.
        </li>
        <li>
          Server data is handled through RTK Query rather than ad hoc Redux
          slices.
        </li>
        <li>
          Non-trivial forms are schema-driven and use reusable field patterns.
        </li>
      </ul>
      <h4>Product surfaces</h4>
      <ul>
        <li>topic forms and topic settings modal</li>
        <li>topic list and topic detail workspace</li>
        <li>event entry and assessment update forms</li>
        <li>current assessment panel and compact timeline rows</li>
        <li>
          source URL editor, source indicators, and citation management UI
        </li>
        <li>uncited state and review-oriented UI states</li>
      </ul>
      <h4>Key points</h4>
      <ul>
        <li>
          The frontend is built around reusable app infrastructure, not one-off
          screens.
        </li>
        <li>
          Tailwind, shadcn-style components, and Radix are used as a layered
          system.
        </li>
        <li>
          RTK Query standardizes server-state management, while schema-driven
          forms reduce manual validation and field wiring.
        </li>
        <li>
          Product-specific components remain local to Signal Tracker so the UI
          can stay expressive without becoming generic infrastructure.
        </li>
      </ul>
    </>
  );
}

function AwsNativeDeliveryStackDetail() {
  return (
    <>
      <p>
        Signal Tracker is backed by AWS infrastructure managed in code. A
        dedicated <code>signal-tracker-infra</code> package uses AWS CDK to
        define the deployment model.
      </p>
      <h4>Infrastructure scope</h4>
      <ul>
        <li>static web hosting</li>
        <li>HTTP API routing</li>
        <li>Lambda-style TypeScript API execution</li>
        <li>Aurora PostgreSQL Serverless v2</li>
        <li>database secrets and Data API access</li>
        <li>GitHub-connected deployment pipeline</li>
        <li>production build and publish steps</li>
      </ul>
      <p>
        The infrastructure package wires the TypeScript API into a Node.js
        Lambda handler, exposes it through an HTTP API, creates a static SPA
        site, and outputs deployment values for the API, web app, database,
        CloudFront distribution, and deployment pipeline.
      </p>
      <h4>Relational persistence</h4>
      <p>
        Aurora PostgreSQL Serverless v2 gives Signal Tracker a relational
        database model that fits the domain: topics, entries, assessment subtype
        rows, sources, evidence items, evidence anchors, citations, review
        notes, and entry lifecycle state.
      </p>
      <p>
        Drizzle defines typed PostgreSQL tables with indexes, constraints, valid
        enum-like values, and relational references. That is a better fit for
        Signal Tracker than forcing the model into a document store only to
        optimize for idle cost.
      </p>
      <h4>Cost and operations posture</h4>
      <ul>
        <li>Aurora can scale down to 0 ACU after inactivity.</li>
        <li>
          Recruiting or portfolio-review mode can keep minimum capacity at 0.5
          ACU.
        </li>
        <li>
          Database wake-up latency is handled explicitly in product and frontend
          behavior.
        </li>
        <li>Basic health checks avoid touching the database.</li>
        <li>
          DB-backed requests can retry known persistence-unavailable states.
        </li>
      </ul>
      <h4>Delivery workflow</h4>
      <p>
        API scripts support local development, Drizzle migration generation,
        deployed migration execution, deployed database smoke testing, deployed
        database verification, build, lint, typecheck, and tests. Buildspecs
        install dependencies, build filtered packages, deploy infrastructure,
        read CloudFormation outputs, and publish the web app.
      </p>
      <h4>Key points</h4>
      <ul>
        <li>AWS CDK defines the infrastructure.</li>
        <li>The API is a Lambda-style TypeScript backend.</li>
        <li>The web app is deployed as a static SPA.</li>
        <li>
          API Gateway routes are derived from shared Signal Tracker route
          definitions.
        </li>
        <li>
          Aurora PostgreSQL Serverless v2 provides relational persistence.
        </li>
        <li>RDS Data API avoids early VPC, NAT, and RDS Proxy complexity.</li>
        <li>Drizzle manages schema and migrations.</li>
        <li>
          The infrastructure reflects deliberate trade-offs, not default
          tutorial architecture.
        </li>
      </ul>
    </>
  );
}

export {
  AiOrchestratedWorkflowDetail,
  AwsNativeDeliveryStackDetail,
  FrontendPlatformDetail,
  FullStackContractsDetail
};

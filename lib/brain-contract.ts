import type { AccessPolicy } from './access-policy';
import { accessPolicyCatalog } from './access-policy';
import type { IdentityRole } from './development-registry';
import type { ActivityLog, AdminConnection, App, Profile, ProjectAutomation } from './types';

export const BRAIN_CONTRACT_VERSION = '1.1.0';

export const BRAIN_DOMAINS = [
  'design-system', 'page-layout', 'roles-access', 'app-page-rules',
  'project-page-rules', 'navigation-rules', 'database-rls', 'feature-matrix', 'development',
] as const;

export type BrainDomain = typeof BRAIN_DOMAINS[number];
export type BrainResource = 'page' | 'app' | 'project' | 'profile' | 'database' | 'feature' | 'development';
export type BrainAction = 'read' | 'create' | 'update' | 'delete' | 'execute' | 'audit';
export type BrainScope = 'public' | 'own' | 'role' | 'operational' | 'system';

export type BrainRule = {
  id: string;
  domain: BrainDomain;
  resource: BrainResource;
  action: BrainAction;
  scope: BrainScope;
  roles: readonly IdentityRole[];
  statement: string;
};

export type BrainApp = { id: string; sourceType: 'App'; pageIds: readonly string[] };
export type BrainPage = {
  id: string;
  route: string;
  appIds: readonly string[];
  layoutId: string;
  accessRuleIds: readonly string[];
  featureIds: readonly string[];
};
export type BrainLayout = { id: string; designRuleIds: readonly string[] };
export type BrainProject = {
  id: string;
  sourceType: 'ProjectAutomation';
  appIds: readonly string[];
  pageIds: readonly string[];
  featureIds: readonly string[];
};
export type BrainFeature = {
  id: string;
  appIds: readonly string[];
  pageIds: readonly string[];
  projectIds: readonly string[];
  availableRoles: readonly IdentityRole[];
  actions: readonly BrainAction[];
  scopes: readonly BrainScope[];
};
export type BrainAccessRule = {
  id: string;
  policyId: string;
  roles: readonly IdentityRole[];
  resource: BrainResource;
  action: BrainAction;
  scope: BrainScope;
};
export type BrainDataResource = {
  id: string;
  name: string;
  sourceType: 'Profile' | 'App' | 'ProjectAutomation' | 'ActivityLog' | 'AdminConnection';
  appIds: readonly string[];
  projectIds: readonly string[];
  pageIds: readonly string[];
  featureIds: readonly string[];
};
export type BrainRuleReference = { developmentRecordId: string; brainRuleId: string };
export type DevelopmentRecord = {
  id: string;
  status: 'actual' | 'reconciled' | 'blocked';
  brainRuleReference: BrainRuleReference;
};
export type RelationshipType = 'defines' | 'provides' | 'uses' | 'composes' | 'references' | 'controls' | 'maps-to' | 'reconciles';
export type Relationship = {
  id: string;
  sourceDomain: BrainDomain;
  sourceId: string;
  targetDomain: BrainDomain;
  targetId: string;
  relationshipType: RelationshipType;
  version: string;
  status: 'active' | 'planned' | 'deprecated';
};

export type BrainRegistry = {
  version: string;
  domains: readonly BrainDomain[];
  rules: readonly BrainRule[];
  apps: readonly BrainApp[];
  pages: readonly BrainPage[];
  layouts: readonly BrainLayout[];
  projects: readonly BrainProject[];
  features: readonly BrainFeature[];
  accessRules: readonly BrainAccessRule[];
  dataResources: readonly BrainDataResource[];
  developmentRecords: readonly DevelopmentRecord[];
  brainRuleReferences: readonly BrainRuleReference[];
  relationships: readonly Relationship[];
  accessPolicies: readonly AccessPolicy[];
};

const ALL_ROLES: readonly IdentityRole[] = ['USER', 'ADMIN', 'SUPER_ADMIN'];
const ADMIN_ROLES: readonly IdentityRole[] = ['ADMIN', 'SUPER_ADMIN'];
const LAYOUT_ID = 'layout.tpw.default';
const PORTAL_APP_ID = 'app.tpw.portal';
const EVENT_APP_ID = 'app.event';
const PROJECT_ID = 'project.tpw.portal';
const PROFILE_PAGE_ID = 'page.portal.profile';
const DASHBOARD_PAGE_ID = 'page.portal.dashboard';
const EVENT_PAGE_ID = 'page.event.home';
const PROFILE_ACCESS_ID = 'access.profile.own';
const ADMIN_ACCESS_ID = 'access.admin.operational';
const DESIGN_RULE_ID = 'rule.design-system.visual-language';
const DEVELOPMENT_RULE_ID = 'rule.development.reconciliation';
const DEVELOPMENT_RECORD_ID = 'development.current-state';

export const brainRegistry: BrainRegistry = {
  version: BRAIN_CONTRACT_VERSION,
  domains: BRAIN_DOMAINS,
  accessPolicies: accessPolicyCatalog,
  rules: [
    { id: DESIGN_RULE_ID, domain: 'design-system', resource: 'page', action: 'read', scope: 'public', roles: ALL_ROLES, statement: 'TPW uses the established visual and component language.' },
    { id: 'ROLE_USER_PROFILE', domain: 'roles-access', resource: 'profile', action: 'read', scope: 'own', roles: ALL_ROLES, statement: 'Authenticated users can read their own profile identity.' },
    { id: 'rule.roles-access.admin-operations', domain: 'roles-access', resource: 'page', action: 'execute', scope: 'operational', roles: ADMIN_ROLES, statement: 'Admins operate administrative resources.' },
    { id: DEVELOPMENT_RULE_ID, domain: 'development', resource: 'development', action: 'audit', scope: 'system', roles: ADMIN_ROLES, statement: 'Development reports actual implementation state against Brain.' },
  ],
  apps: [
    { id: PORTAL_APP_ID, sourceType: 'App', pageIds: [DASHBOARD_PAGE_ID, PROFILE_PAGE_ID] },
    { id: EVENT_APP_ID, sourceType: 'App', pageIds: [EVENT_PAGE_ID] },
  ],
  pages: [
    { id: DASHBOARD_PAGE_ID, route: '/dashboard', appIds: [PORTAL_APP_ID], layoutId: LAYOUT_ID, accessRuleIds: [PROFILE_ACCESS_ID], featureIds: ['feature.portal.workspace'] },
    { id: PROFILE_PAGE_ID, route: '/profile', appIds: [PORTAL_APP_ID], layoutId: LAYOUT_ID, accessRuleIds: [PROFILE_ACCESS_ID], featureIds: ['feature.portal.identity'] },
    { id: EVENT_PAGE_ID, route: '/apps/event', appIds: [EVENT_APP_ID], layoutId: LAYOUT_ID, accessRuleIds: [PROFILE_ACCESS_ID], featureIds: ['feature.event.workspace'] },
  ],
  layouts: [{ id: LAYOUT_ID, designRuleIds: [DESIGN_RULE_ID] }],
  projects: [{ id: PROJECT_ID, sourceType: 'ProjectAutomation', appIds: [PORTAL_APP_ID, EVENT_APP_ID], pageIds: [DASHBOARD_PAGE_ID, PROFILE_PAGE_ID, EVENT_PAGE_ID], featureIds: ['feature.portal.workspace', 'feature.portal.identity', 'feature.event.workspace'] }],
  features: [
    { id: 'feature.portal.workspace', appIds: [PORTAL_APP_ID], pageIds: [DASHBOARD_PAGE_ID], projectIds: [PROJECT_ID], availableRoles: ALL_ROLES, actions: ['read'], scopes: ['own'] },
    { id: 'feature.portal.identity', appIds: [PORTAL_APP_ID], pageIds: [PROFILE_PAGE_ID], projectIds: [PROJECT_ID], availableRoles: ALL_ROLES, actions: ['read', 'update'], scopes: ['own'] },
    { id: 'feature.event.workspace', appIds: [EVENT_APP_ID], pageIds: [EVENT_PAGE_ID], projectIds: [PROJECT_ID], availableRoles: ALL_ROLES, actions: ['read'], scopes: ['own'] },
  ],
  accessRules: [
    { id: PROFILE_ACCESS_ID, policyId: 'PAGE_PROFILE', roles: ALL_ROLES, resource: 'profile', action: 'read', scope: 'own' },
    { id: ADMIN_ACCESS_ID, policyId: 'PAGE_ADMIN', roles: ADMIN_ROLES, resource: 'page', action: 'execute', scope: 'operational' },
  ],
  dataResources: [
    { id: 'data.profiles', name: 'profiles', sourceType: 'Profile', appIds: [PORTAL_APP_ID], projectIds: [PROJECT_ID], pageIds: [PROFILE_PAGE_ID], featureIds: ['feature.portal.identity'] },
    { id: 'data.apps', name: 'apps', sourceType: 'App', appIds: [PORTAL_APP_ID, EVENT_APP_ID], projectIds: [PROJECT_ID], pageIds: [DASHBOARD_PAGE_ID, EVENT_PAGE_ID], featureIds: [] },
    { id: 'data.project-automations', name: 'project_automations', sourceType: 'ProjectAutomation', appIds: [PORTAL_APP_ID, EVENT_APP_ID], projectIds: [PROJECT_ID], pageIds: [DASHBOARD_PAGE_ID], featureIds: ['feature.portal.workspace'] },
    { id: 'data.activity-log', name: 'activity_log', sourceType: 'ActivityLog', appIds: [PORTAL_APP_ID], projectIds: [PROJECT_ID], pageIds: [], featureIds: [] },
    { id: 'data.admin-connections', name: 'admin_connections', sourceType: 'AdminConnection', appIds: [PORTAL_APP_ID], projectIds: [PROJECT_ID], pageIds: [], featureIds: [] },
  ],
  developmentRecords: [{ id: DEVELOPMENT_RECORD_ID, status: 'actual', brainRuleReference: { developmentRecordId: DEVELOPMENT_RECORD_ID, brainRuleId: DEVELOPMENT_RULE_ID } }],
  brainRuleReferences: [{ developmentRecordId: DEVELOPMENT_RECORD_ID, brainRuleId: DEVELOPMENT_RULE_ID }],
  relationships: [
    { id: 'rel.design-system.default-layout', sourceDomain: 'design-system', sourceId: DESIGN_RULE_ID, targetDomain: 'page-layout', targetId: LAYOUT_ID, relationshipType: 'defines', version: BRAIN_CONTRACT_VERSION, status: 'active' },
    { id: 'rel.layout.portal-page', sourceDomain: 'page-layout', sourceId: LAYOUT_ID, targetDomain: 'app-page-rules', targetId: DASHBOARD_PAGE_ID, relationshipType: 'provides', version: BRAIN_CONTRACT_VERSION, status: 'active' },
    { id: 'rel.access.portal-page', sourceDomain: 'roles-access', sourceId: PROFILE_ACCESS_ID, targetDomain: 'app-page-rules', targetId: PROFILE_PAGE_ID, relationshipType: 'controls', version: BRAIN_CONTRACT_VERSION, status: 'active' },
    { id: 'rel.app.portal-page', sourceDomain: 'app-page-rules', sourceId: PORTAL_APP_ID, targetDomain: 'app-page-rules', targetId: DASHBOARD_PAGE_ID, relationshipType: 'provides', version: BRAIN_CONTRACT_VERSION, status: 'active' },
    { id: 'rel.app.portal-project', sourceDomain: 'app-page-rules', sourceId: PORTAL_APP_ID, targetDomain: 'project-page-rules', targetId: PROJECT_ID, relationshipType: 'uses', version: BRAIN_CONTRACT_VERSION, status: 'active' },
    { id: 'rel.project.event-page', sourceDomain: 'project-page-rules', sourceId: PROJECT_ID, targetDomain: 'app-page-rules', targetId: EVENT_PAGE_ID, relationshipType: 'composes', version: BRAIN_CONTRACT_VERSION, status: 'active' },
    { id: 'rel.page.portal-layout', sourceDomain: 'app-page-rules', sourceId: PROFILE_PAGE_ID, targetDomain: 'page-layout', targetId: LAYOUT_ID, relationshipType: 'references', version: BRAIN_CONTRACT_VERSION, status: 'active' },
    { id: 'rel.page.portal-access', sourceDomain: 'app-page-rules', sourceId: PROFILE_PAGE_ID, targetDomain: 'roles-access', targetId: PROFILE_ACCESS_ID, relationshipType: 'references', version: BRAIN_CONTRACT_VERSION, status: 'active' },
    { id: 'rel.page.portal-feature', sourceDomain: 'app-page-rules', sourceId: PROFILE_PAGE_ID, targetDomain: 'feature-matrix', targetId: 'feature.portal.identity', relationshipType: 'provides', version: BRAIN_CONTRACT_VERSION, status: 'active' },
    { id: 'rel.project.portal-feature', sourceDomain: 'project-page-rules', sourceId: PROJECT_ID, targetDomain: 'feature-matrix', targetId: 'feature.portal.identity', relationshipType: 'uses', version: BRAIN_CONTRACT_VERSION, status: 'active' },
    { id: 'rel.access.profile-data', sourceDomain: 'roles-access', sourceId: PROFILE_ACCESS_ID, targetDomain: 'database-rls', targetId: 'data.profiles', relationshipType: 'controls', version: BRAIN_CONTRACT_VERSION, status: 'active' },
    { id: 'rel.feature.identity-data', sourceDomain: 'feature-matrix', sourceId: 'feature.portal.identity', targetDomain: 'database-rls', targetId: 'data.profiles', relationshipType: 'maps-to', version: BRAIN_CONTRACT_VERSION, status: 'active' },
    { id: 'rel.brain.development', sourceDomain: 'development', sourceId: DEVELOPMENT_RULE_ID, targetDomain: 'development', targetId: DEVELOPMENT_RECORD_ID, relationshipType: 'reconciles', version: BRAIN_CONTRACT_VERSION, status: 'active' },
  ],
};

function collectIds(registry: BrainRegistry): Set<string> {
  return new Set([
    ...registry.rules.map((item) => item.id), ...registry.apps.map((item) => item.id),
    ...registry.pages.map((item) => item.id), ...registry.layouts.map((item) => item.id),
    ...registry.projects.map((item) => item.id), ...registry.features.map((item) => item.id),
    ...registry.accessRules.map((item) => item.id), ...registry.dataResources.map((item) => item.id),
    ...registry.developmentRecords.map((item) => item.id),
  ]);
}

export function validateBrainRegistry(registry: BrainRegistry): void {
  const errors: string[] = [];
  const validDomains = new Set<string>(BRAIN_DOMAINS);
  const ids = collectIds(registry);
  const relationshipIds = new Set<string>();

  if (registry.domains.length !== BRAIN_DOMAINS.length || registry.domains.some((domain) => !validDomains.has(domain))) {
    errors.push('Brain registry must contain exactly the 9 canonical domains.');
  }
  for (const relationship of registry.relationships) {
    if (relationshipIds.has(relationship.id)) errors.push(`Duplicate relationship id: ${relationship.id}`);
    relationshipIds.add(relationship.id);
    if (!validDomains.has(relationship.sourceDomain)) errors.push(`Invalid relationship source domain: ${relationship.sourceDomain}`);
    if (!validDomains.has(relationship.targetDomain)) errors.push(`Invalid relationship target domain: ${relationship.targetDomain}`);
    if (!ids.has(relationship.sourceId)) errors.push(`Missing relationship source id: ${relationship.sourceId}`);
    if (!ids.has(relationship.targetId)) errors.push(`Missing relationship target id: ${relationship.targetId}`);
  }
  for (const reference of registry.brainRuleReferences) {
    if (!registry.rules.some((rule) => rule.id === reference.brainRuleId)) errors.push(`Missing referenced Brain rule id: ${reference.brainRuleId}`);
  }
  if (errors.length > 0) throw new Error(`Brain registry validation failed:\n${errors.map((error) => `- ${error}`).join('\n')}`);
}

validateBrainRegistry(brainRegistry);

export type BrainConsoleDraft = {
  target: { id: string; name: string; app_id: string };
  domains: Partial<Record<BrainDomain, unknown>>;
  permits?: readonly Record<string, unknown>[];
};

export type BrainConsoleVerification = {
  ok: boolean;
  errors: string[];
};

export function verifyBrainConsoleDraft(input: unknown): BrainConsoleVerification {
  const errors: string[] = [];
  const draft = input as Partial<BrainConsoleDraft> | null;
  const domains = draft && typeof draft === 'object' && draft.domains && typeof draft.domains === 'object'
    ? draft.domains
    : null;

  if (!draft || typeof draft !== 'object' || !draft.target || typeof draft.target !== 'object') {
    errors.push('contract.target: selected target is required');
  } else {
    if (!draft.target.id) errors.push('contract.target.id: target id is required');
    if (!draft.target.app_id) errors.push('contract.target.app_id: target app id is required');
  }

  if (!domains) {
    errors.push('contract.domains: all 9 Brain domains are required');
  } else {
    for (const domain of BRAIN_DOMAINS) {
      if (!(domain in domains)) errors.push(`contract.domains.${domain}: domain is required`);
    }
  }

  if (errors.length > 0) return { ok: false, errors };

  const ruleIds = new Set(brainRegistry.rules.map((rule) => rule.id));
  const rules = (domains?.['roles-access'] as { rules?: unknown } | undefined)?.rules;
  if (rules && Array.isArray(rules)) {
    for (let index = 0; index < rules.length; index += 1) {
      const rule = rules[index];
      if (!rule || typeof rule !== 'object') errors.push(`contract.domains.roles-access.rules[${index}]: rule must be an object`);
      else if (typeof (rule as { id?: unknown }).id === 'string' && ruleIds.has((rule as { id: string }).id)) {
        errors.push(`contract.domains.roles-access.rules[${index}]: duplicate canonical rule id`);
      }
    }
  }

  return { ok: errors.length === 0, errors };
}

export type BrainDataContracts = {
  Profile: Profile;
  App: App;
  ProjectAutomation: ProjectAutomation;
  ActivityLog: ActivityLog;
  AdminConnection: AdminConnection;
};

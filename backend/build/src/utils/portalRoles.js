"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.allowedRolesForPortal = exports.Role = exports.Portal = void 0;
exports.isRoleAllowedForPortal = isRoleAllowedForPortal;
exports.Portal = {
    FRONTEND: 'frontend',
    ADMIN_PANEL: 'admin-panel',
    PARTNER_APP: 'partner-app',
};
exports.Role = {
    USER: 'user',
    ADMIN: 'admin',
    PARTNER: 'partner',
};
exports.allowedRolesForPortal = {
    [exports.Portal.FRONTEND]: [exports.Role.USER],
    [exports.Portal.ADMIN_PANEL]: [exports.Role.ADMIN],
    [exports.Portal.PARTNER_APP]: [exports.Role.PARTNER],
};
function isRoleAllowedForPortal(portal, role) {
    if (!portal)
        return false;
    const p = portal;
    const r = role;
    const allowed = exports.allowedRolesForPortal[p];
    if (!allowed || !r)
        return false;
    return allowed.includes(r);
}
exports.default = { Portal: exports.Portal, Role: exports.Role, allowedRolesForPortal: exports.allowedRolesForPortal, isRoleAllowedForPortal };
//# sourceMappingURL=portalRoles.js.map
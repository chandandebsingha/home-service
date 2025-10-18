export declare const Portal: {
    readonly FRONTEND: "frontend";
    readonly ADMIN_PANEL: "admin-panel";
    readonly PARTNER_APP: "partner-app";
};
export type PortalName = typeof Portal[keyof typeof Portal];
export declare const Role: {
    readonly USER: "user";
    readonly ADMIN: "admin";
    readonly PARTNER: "partner";
};
export type RoleName = typeof Role[keyof typeof Role];
export declare const allowedRolesForPortal: Record<PortalName, RoleName[]>;
export declare function isRoleAllowedForPortal(portal: string | undefined, role: string | undefined): boolean;
declare const _default: {
    Portal: {
        readonly FRONTEND: "frontend";
        readonly ADMIN_PANEL: "admin-panel";
        readonly PARTNER_APP: "partner-app";
    };
    Role: {
        readonly USER: "user";
        readonly ADMIN: "admin";
        readonly PARTNER: "partner";
    };
    allowedRolesForPortal: Record<PortalName, RoleName[]>;
    isRoleAllowedForPortal: typeof isRoleAllowedForPortal;
};
export default _default;
//# sourceMappingURL=portalRoles.d.ts.map
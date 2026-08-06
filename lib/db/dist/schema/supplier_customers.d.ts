import { z } from "zod/v4";
export declare const supplierCustomersTable: import("drizzle-orm/pg-core").PgTableWithColumns<{
    name: "supplier_customers";
    schema: undefined;
    columns: {
        id: import("drizzle-orm/pg-core").PgColumn<{
            name: "id";
            tableName: "supplier_customers";
            dataType: "number";
            columnType: "PgSerial";
            data: number;
            driverParam: number;
            notNull: true;
            hasDefault: true;
            isPrimaryKey: true;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: undefined;
            baseColumn: never;
            identity: undefined;
            generated: undefined;
        }, {}, {}>;
        supplierId: import("drizzle-orm/pg-core").PgColumn<{
            name: "supplier_id";
            tableName: "supplier_customers";
            dataType: "number";
            columnType: "PgInteger";
            data: number;
            driverParam: string | number;
            notNull: true;
            hasDefault: false;
            isPrimaryKey: false;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: undefined;
            baseColumn: never;
            identity: undefined;
            generated: undefined;
        }, {}, {}>;
        homeownerId: import("drizzle-orm/pg-core").PgColumn<{
            name: "homeowner_id";
            tableName: "supplier_customers";
            dataType: "number";
            columnType: "PgInteger";
            data: number;
            driverParam: string | number;
            notNull: true;
            hasDefault: false;
            isPrimaryKey: false;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: undefined;
            baseColumn: never;
            identity: undefined;
            generated: undefined;
        }, {}, {}>;
        linkedAt: import("drizzle-orm/pg-core").PgColumn<{
            name: "linked_at";
            tableName: "supplier_customers";
            dataType: "date";
            columnType: "PgTimestamp";
            data: Date;
            driverParam: string;
            notNull: true;
            hasDefault: true;
            isPrimaryKey: false;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: undefined;
            baseColumn: never;
            identity: undefined;
            generated: undefined;
        }, {}, {}>;
    };
    dialect: "pg";
}>;
export declare const insertSupplierCustomerSchema: z.ZodObject<{
    homeownerId: z.ZodInt;
    supplierId: z.ZodInt;
}, {
    out: {};
    in: {};
}>;
export type InsertSupplierCustomer = z.infer<typeof insertSupplierCustomerSchema>;
export type SupplierCustomer = typeof supplierCustomersTable.$inferSelect;
//# sourceMappingURL=supplier_customers.d.ts.map
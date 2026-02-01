# Database Migrations Documentation

This document organizes all database migrations into logical groups to help understand the evolution of the database schema.

**Total Migrations**: 52 migrations (105 files including `.down.sql` rollback files)

---

## Migration Strategy

This project follows **best practices** for database migrations:

- ✅ **Small, Focused Changes**: Each migration does one logical thing
- ✅ **Reversible**: Every migration has a corresponding `.down.sql` rollback file
- ✅ **Zero-Downtime Safe**: Schema changes are separated from data migrations
- ✅ **Version Controlled**: All migrations are committed and never modified after deployment

---

## Migration Groups

### Group 1: Core Schema (Foundation)
**Date Range**: 2025-12-29 to 2025-12-30  
**Purpose**: Initial database structure

| Migration | Description |
|-----------|-------------|
| `20251229000001_create_users_table` | Create users table with authentication |
| `20251230090133_create_projects_table` | Create projects table (core portfolio/client projects) |
| `20251230091352_create_project_thumbnails_storage` | Create storage bucket for project thumbnails |
| `20251230100001_create_tracking_codes_table` | Create tracking codes for public project links |
| `20251230100002_create_project_phases_table` | Create project phases (milestones) |
| `20251230100003_create_project_tasks_attachments_tables` | Create tasks and attachments tables |
| `20251230100004_create_project_attachments_storage` | Create storage bucket for attachments |
| `20251230100005_add_project_notifications_enabled` | Add notifications toggle to projects |
| `20251230100006_add_client_id_to_projects` | Link projects to client users |

**Why separate?** Each table/feature was created incrementally as features were developed.

---

### Group 2: User Features & Preferences
**Date Range**: 2025-12-30  
**Purpose**: User management and preferences

| Migration | Description |
|-----------|-------------|
| `20251230110001_create_user_preferences_table` | User settings and preferences |
| `20251230110002_create_activity_log_table` | Activity tracking for audit trail |
| `20251230110005_create_notifications_table` | User notification system |

**Why separate?** User features were added after core schema was stable.

---

### Group 3: Client Groups & Collaboration
**Date Range**: 2025-12-30  
**Purpose**: Multi-user client organizations

| Migration | Description |
|-----------|-------------|
| `20251230110003_create_client_groups_tables` | Client organization groups |
| `20251230120001_add_client_projects_rls_policy` | RLS policy for client access |

**Why separate?** Collaboration features added after individual client features.

---

### Group 4: Billing & Payments
**Date Range**: 2025-12-30  
**Purpose**: Invoicing and payment processing

| Migration | Description |
|-----------|-------------|
| `20251230120001_create_invoices_table` | Invoice management |
| `20251230120003_create_payments_table` | Payment tracking |
| `20251230120005_create_subscriptions_table` | Subscription management |
| `20251230120006_create_tax_rates_table` | Tax rate configuration |
| `20251230120007_add_estimated_cost_to_phases_tasks` | Cost estimation fields |
| `20251230120008_add_stripe_customer_id_to_users` | Stripe integration |

**Why separate?** Billing features added as a separate feature set.

---

### Group 5: Project Requests (Legacy)
**Date Range**: 2025-12-30  
**Purpose**: Original project request system (later migrated to unified projects)

| Migration | Description |
|-----------|-------------|
| `20251230130001_create_request_status_enum` | Request status enum type |
| `20251230130002_create_project_requests_table` | Project requests table |
| `20251230130003_create_project_request_attachments_table` | Request attachments |
| `20251230130004_extend_project_status_enum` | Extended project status enum |
| `20251230130005_add_project_approval_fields` | Approval workflow fields |
| `20251230130006_create_project_request_attachments_storage` | Storage bucket for requests |

**Why separate?** This was the original system before the unified project management refactor. These tables were later migrated to the unified `projects` table.

---

### Group 6: Unified Project Management - Status Enum Replacement
**Date Range**: 2025-12-30  
**Purpose**: Replace old status enum with new unified status system  
**Task Group**: 1 (from Unified Project Management spec)

| Migration | Description | Why Separate? |
|-----------|-------------|----------------|
| `20251230230320_create_new_project_status_enum` | Create new `project_status_new` enum | Must create enum before using it |
| `20251230230321_add_temp_status_column` | Add temporary `status_new` column | Zero-downtime: keep old column during migration |
| `20251230230322_map_old_statuses_to_new` | Map old status values to new | Data migration separate from schema change |
| `20251230230323_replace_status_column` | Drop old column, rename new | Schema change after data is migrated |
| `20251230230324_update_rls_policies_for_new_status` | Update RLS policies | Policy updates after schema is stable |

**Why 5 migrations?** This follows a **zero-downtime migration pattern**:
1. Create new enum (no breaking changes)
2. Add temp column (backwards compatible)
3. Migrate data (safe, can rollback)
4. Replace column (atomic operation)
5. Update policies (after schema is stable)

---

### Group 7: Unified Project Management - Projects Table Updates
**Date Range**: 2025-12-30  
**Purpose**: Add new fields to support unified workflow  
**Task Group**: 2 (from Unified Project Management spec)

| Migration | Description | Why Separate? |
|-----------|-------------|----------------|
| `20251230230325_add_is_hiring_request_field` | Add `is_hiring_request` boolean | Single logical change |
| `20251230230326_add_deleted_at_field` | Add soft-delete support | Single logical change |
| `20251230230327_create_indexes_for_new_fields` | Create indexes for performance | Index creation separate from column addition |
| `20251230230328_update_rls_policies_for_projects_table` | Update RLS for new fields | Policy updates after schema changes |

**Why 4 migrations?** Each field addition is separate for:
- Easier rollback if one field causes issues
- Clearer git history
- Better testing isolation

---

### Group 8: Unified Project Management - Project Comments
**Date Range**: 2025-12-30  
**Purpose**: Add comment/threading system  
**Task Group**: 3 (from Unified Project Management spec)

| Migration | Description | Why Separate? |
|-----------|-------------|----------------|
| `20251230231007_create_project_comments_table` | Create comments table | Core table creation |
| `20251230231008_create_project_comment_attachments_table` | Create attachments table | Related but separate table |
| `20251230231009_create_indexes_for_project_comments` | Create indexes | Performance optimization separate |
| `20251230231010_create_rls_policies_for_project_comments` | Create RLS policies | Security policies after schema |

**Why 4 migrations?** Standard pattern:
1. Create main table
2. Create related tables
3. Add indexes (can be slow on large tables)
4. Add RLS policies (security layer)

---

### Group 9: Unified Project Management - Project Templates
**Date Range**: 2025-12-30  
**Purpose**: Add project template system  
**Task Group**: 4 (from Unified Project Management spec)

| Migration | Description | Why Separate? |
|-----------|-------------|----------------|
| `20251230231011_create_project_templates_table` | Create templates table | Core table creation |
| `20251230231012_create_project_template_attachments_table` | Create template attachments | Related table |
| `20251230231013_create_indexes_for_project_templates` | Create indexes | Performance optimization |
| `20251230231014_create_rls_policies_for_project_templates` | Create RLS policies | Security policies |

**Why 4 migrations?** Same pattern as comments (Group 8) for consistency.

---

### Group 10: Unified Project Management - Data Migration
**Date Range**: 2025-12-30  
**Purpose**: Migrate project_requests to unified projects table  
**Task Group**: 6 (from Unified Project Management spec)

| Migration | Description |
|-----------|-------------|
| `20251230231529_migrate_project_requests_to_projects` | Migrate all project_requests data to projects table |

**Why 1 migration?** This is a **data migration** (not schema change), so it's a single operation that:
- Migrates all project_requests records
- Migrates attachments
- Updates foreign key references
- Can be rolled back if needed

---

### Group 11: RLS Policy Fixes & Updates
**Date Range**: 2025-01-01 to 2025-01-02  
**Purpose**: Fix and improve Row Level Security policies

| Migration | Description | Why Separate? |
|-----------|-------------|----------------|
| `20250101000001_add_client_insert_projects_policy` | Allow clients to create projects | Single policy addition |
| `20250102000001_fix_client_soft_delete_rls_policy` | Fix soft-delete RLS policy | Bug fix, separate for clarity |
| `20250102000002_add_comment_notification_types` | Add notification types for comments | Enum extension |
| `20250102000003_update_notifications_rls_for_comments` | Update notification RLS | Policy update after enum change |
| `20250102000004_add_missing_activity_log_event_types` | Add missing activity log types | Enum extension |
| `20250102000005_allow_clients_create_activity_logs` | Allow clients to create activity logs | Policy addition |
| `20250102000006_allow_users_read_through_foreign_keys` | Fix foreign key RLS access | Bug fix |
| `20250102000007_replace_rls_with_dev_policies` | Development RLS policies | Development environment setup |

**Why 8 migrations?** Each policy fix/update is separate because:
- Easier to identify which policy caused issues
- Can rollback individual policy changes
- Clearer git history for debugging

---

## Migration Patterns

### Pattern 1: Table Creation
```
1. Create main table
2. Create related tables (if needed)
3. Create indexes
4. Create RLS policies
```

**Example**: Project Comments (Group 8)

### Pattern 2: Zero-Downtime Column Replacement
```
1. Create new enum/type
2. Add temporary column
3. Migrate data
4. Replace column
5. Update policies
```

**Example**: Status Enum Replacement (Group 6)

### Pattern 3: Feature Addition
```
1. Add new column(s)
2. Create indexes
3. Update RLS policies
```

**Example**: Projects Table Updates (Group 7)

---

## Why So Many Migrations?

### 1. **Best Practice: Small, Focused Changes**
Each migration does **one logical thing**. This makes it:
- Easier to debug when something goes wrong
- Safer to rollback individual changes
- Clearer to understand in git history

### 2. **Zero-Downtime Deployment**
Complex changes (like status enum replacement) are broken into steps that:
- Don't break existing code
- Can be rolled back at any step
- Allow gradual deployment

### 3. **Testing Isolation**
Small migrations are easier to test:
- Each migration can be tested independently
- Failures are easier to identify
- Rollback is safer

### 4. **Major Refactoring**
The "Unified Project Management" feature (Groups 6-10) was a **major refactoring** that:
- Replaced the entire status system (5 migrations)
- Added new features (comments, templates) (8 migrations)
- Migrated legacy data (1 migration)
- Updated all RLS policies (multiple migrations)

This refactoring alone accounts for **14 migrations** out of 52.

---

## Migration Statistics

| Category | Count | Percentage |
|----------|-------|------------|
| Core Schema | 9 | 17% |
| User Features | 3 | 6% |
| Client Groups | 2 | 4% |
| Billing & Payments | 6 | 12% |
| Project Requests (Legacy) | 6 | 12% |
| **Unified Project Management** | **14** | **27%** |
| RLS Policy Fixes | 8 | 15% |
| **Total** | **52** | **100%** |

---

## Recommendations

### ✅ Keep Current Approach
The current migration strategy is **excellent** and follows industry best practices. The high number of migrations is a **feature, not a bug**:
- Better safety
- Easier debugging
- Safer rollbacks
- Clearer history

### 📝 Documentation
This README helps understand the structure. Consider:
- Adding migration group comments in code
- Linking migrations to task groups in specs
- Documenting complex migrations inline

### 🔄 Future Migrations
When adding new features, follow the established patterns:
- One logical change per migration
- Always include `.down.sql` rollback
- Test migrations in development first
- Document complex migrations

---

## Related Documentation

- [Backend Migration Standards](../../agent-os/standards/backend/migrations.md)
- [Unified Project Management Spec](../../agent-os/specs/2025-12-30-unified-project-management/tasks.md)
- [Project Structure](../../.cursor/rules/project-structure.mdc)

---

*Last Updated: January 2025*

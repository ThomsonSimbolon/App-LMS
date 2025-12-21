# 🔍 Analisis Masalah: ASSESSOR Menggunakan Student Dashboard

## 🐛 Masalah yang Ditemukan

Dari screenshot, ASSESSOR role sedang menggunakan **Student Dashboard** padahal seharusnya menggunakan **Admin Dashboard** (karena ASSESSOR berbagi functionality dengan ADMIN untuk certificate approval).

---

## 📋 Root Cause Analysis

### 1. **Login Redirect Logic - MISSING ASSESSOR**

**File**: `frontend/app/login/page.tsx` (Line 18-32)

```typescript
useEffect(() => {
  if (user) {
    const roleName = user.role.name;
    if (roleName === 'STUDENT') {
      router.push('/dashboard');
    } else if (roleName === 'INSTRUCTOR') {
      router.push('/instructor/dashboard');
    } else if (roleName === 'ADMIN' || roleName === 'SUPER_ADMIN') {
      router.push('/admin/dashboard');
    } else {
      router.push('/dashboard'); // ❌ ASSESSOR masuk ke sini!
    }
  }
}, [user, router]);
```

**Masalah:**
- ASSESSOR tidak disebutkan secara eksplisit
- ASSESSOR masuk ke `else` clause → redirect ke `/dashboard` (Student Dashboard)
- **Seharusnya**: ASSESSOR redirect ke `/admin/dashboard` karena mereka share layout dengan ADMIN

---

### 2. **Dashboard Layout Protection - TIDAK MEMBLOKIR ASSESSOR**

**File**: `frontend/app/dashboard/layout.tsx` (Line 14)

```typescript
const { loading } = useRequireRole(['STUDENT']);
```

**File**: `frontend/hooks/useAuth.ts` (Line 97-99)

```typescript
if (!hasRole(allowedRoles)) {
  router.push(redirectTo); // ❌ Hanya redirect, TIDAK memblokir!
  return;
}
```

**Masalah:**
- `useRequireRole(['STUDENT'])` hanya allow STUDENT
- Tapi hook ini hanya **redirect**, tidak **memblokir akses** secara instant
- ASSESSOR masih bisa akses `/dashboard` karena redirect terjadi setelah render
- **Seharusnya**: ASSESSOR diblokir dari `/dashboard` routes, atau redirect lebih agresif

---

### 3. **Admin Layout - ASSESSOR TIDAK TERMASUK**

**File**: `frontend/app/admin/layout.tsx` (Line 16)

```typescript
const { loading } = useRequireRole(['ADMIN', 'SUPER_ADMIN']);
```

**Masalah:**
- ASSESSOR tidak termasuk dalam `allowedRoles`
- Tapi ada logic untuk handle ASSESSOR di sidebar (line 26): `role === 'ASSESSOR' ? 'assessor' : 'admin'`
- **Kontradiksi**: Sidebar sudah siap untuk ASSESSOR, tapi layout tidak allow ASSESSOR

---

### 4. **StudentHeader - HARDCODED TEXT**

**File**: `frontend/components/layouts/StudentHeader.tsx` (Line 116, 196)

```typescript
<p className="text-xs text-neutral-500 dark:text-neutral-400">
  Student Dashboard // ❌ Hard-coded!
</p>
```

**Masalah:**
- Text "Student Dashboard" hard-coded
- Meskipun user adalah ASSESSOR, tetap menampilkan "Student Dashboard"
- **Seharusnya**: Dinamis berdasarkan role user

---

### 5. **Sidebar Navigation - ASSESSOR SUDAH ADA**

**File**: `frontend/components/layouts/Sidebar.tsx` (Line 117-120, 127-129)

```typescript
const assessorNavigation = [
  { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { name: "Certificates", href: "/admin/certificates", icon: Award },
];

const navigation =
  role === "admin" || role === "super_admin"
    ? adminNavigation
    : role === "instructor"
    ? instructorNavigation
    : role === "assessor"
    ? assessorNavigation  // ✅ Sudah ada!
    : studentNavigation;
```

**Status:**
- ✅ Sidebar sudah siap untuk ASSESSOR
- ✅ Navigation sudah benar (Dashboard + Certificates)
- ✅ Routes sudah benar (`/admin/dashboard`, `/admin/certificates`)

---

## 🎯 Kesimpulan

### Masalah Utama:
1. **ASSESSOR redirect ke `/dashboard` saat login** (harusnya `/admin/dashboard`)
2. **Dashboard layout tidak memblokir ASSESSOR** dengan benar (masih bisa akses)
3. **Admin layout tidak allow ASSESSOR** (tapi sidebar sudah siap untuk ASSESSOR)
4. **StudentHeader hard-coded "Student Dashboard"**

### Yang Sudah Benar:
- ✅ Sidebar sudah support ASSESSOR dengan navigation yang benar
- ✅ ASSESSOR navigation routes sudah benar (`/admin/*`)

---

## ✅ Solusi yang Diperlukan

### 1. Fix Login Redirect
- Tambahkan ASSESSOR ke redirect logic
- ASSESSOR → `/admin/dashboard`

### 2. Fix Admin Layout
- Allow ASSESSOR di `useRequireRole(['ADMIN', 'SUPER_ADMIN', 'ASSESSOR'])`
- Atau buat layout terpisah untuk ASSESSOR (tapi ini overkill karena functionality sama dengan ADMIN)

### 3. Fix Dashboard Layout Protection
- Pastikan ASSESSOR benar-benar diblokir dari `/dashboard/*` routes
- Redirect ke `/admin/dashboard` jika ASSESSOR mencoba akses

### 4. Fix StudentHeader
- Buat header dinamis atau buat AssessorHeader terpisah
- Atau gunakan AdminHeader untuk ASSESSOR juga

---

## 📊 Route Structure Saat Ini vs Seharusnya

| Role | Current Route | Should Be | Layout |
|------|--------------|-----------|--------|
| STUDENT | `/dashboard` | `/dashboard` | ✅ StudentLayout |
| INSTRUCTOR | `/instructor/*` | `/instructor/*` | ✅ InstructorLayout |
| ADMIN | `/admin/*` | `/admin/*` | ✅ AdminLayout |
| SUPER_ADMIN | `/admin/*` | `/admin/*` | ✅ AdminLayout |
| ASSESSOR | `/dashboard` ❌ | `/admin/*` ✅ | ❌ StudentLayout → ✅ AdminLayout |

---

**Status**: ❌ ASSESSOR routing tidak benar  
**Priority**: HIGH (security & UX issue)  
**Complexity**: LOW (simple fixes)


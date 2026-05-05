const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080"

type ApiResult<T> = { data?: T; error?: string; status?: number }

async function apiFetch<T>(path: string, options?: RequestInit): Promise<ApiResult<T>> {
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      ...options,
    })

    if (res.status === 204) return {}

    const body = await res.json().catch(() => null)

    if (!res.ok) {
      const msg = body?.mensaje ?? body?.message ?? body?.error ?? "Error inesperado"
      return { error: msg, status: res.status }
    }

    return { data: body as T }
  } catch {
    return { error: "No se pudo conectar con el servidor", status: 0 }
  }
}

// ── Types ──────────────────────────────────────────────────────────────────

export type Cuenta = {
  id: number
  numeroCuenta: string
  tipoCuenta: string
  saldo: number
  estado: string
  permiteTransacciones: boolean
  etiquetaVisual: string | null
}

export type Transaccion = {
  id: number
  fecha: string
  concepto: string
  tipo: string
  monto: number
}

export type RegistroData = {
  documento: string
  fechaExpedicion: string
  nombre: string
  email: string
  direccion: string
  telefono: string
  username: string
  password: string
}

// ── Session marker (readable by middleware — no es el JWT) ──────────────────

function setSessionCookie() {
  if (typeof document !== "undefined") {
    document.cookie = "session=1; path=/; max-age=604800; SameSite=Lax"
  }
}

function clearSessionCookie() {
  if (typeof document !== "undefined") {
    document.cookie = "session=; path=/; max-age=0; SameSite=Lax"
  }
}

// ── Auth ────────────────────────────────────────────────────────────────────

export async function login(username: string, password: string) {
  const result = await apiFetch<{ mensaje: string }>("/api/v1/auth/login", {
    method: "POST",
    body: JSON.stringify({ username, password }),
  })
  if (!result.error) setSessionCookie()
  return result
}

export async function logout() {
  const result = await apiFetch<{ mensaje: string }>("/api/v1/auth/logout", { method: "POST" })
  clearSessionCookie()
  return result
}

// ── Perfil ──────────────────────────────────────────────────────────────────

type ProfileDTO = {
  fullName: string
  identificationNumber: string
  accountNumber: string
  balance: number
  email?: string
  telefono?: string
  idCliente?: number
}

export async function getPerfil() {
  const result = await apiFetch<ProfileDTO>("/api/v1/perfil/me")
  if (result.error) return result as ApiResult<{ nombre: string; documento: string; email: string; telefono: string; idCliente: number }>
  const d = result.data
  return {
    data: {
      nombre: d?.fullName ?? "",
      documento: d?.identificationNumber ?? "",
      email: d?.email ?? "",
      telefono: d?.telefono ?? "",
      idCliente: d?.idCliente ?? 0,
    },
  }
}

export function updatePerfil(data: { email: string; telefono: string }) {
  return apiFetch<{ mensaje: string }>("/api/v1/clientes/me", {
    method: "PUT",
    body: JSON.stringify(data),
  })
}

// ── Cuentas ──────────────────────────────────────────────────────────────────

type CuentaResumenDTO = {
  idCuenta: number
  numeroCuenta: string
  tipo: string
  saldo: number
  estado: string
  permiteTransacciones: boolean
  etiquetaVisual: string | null
}

export async function getDashboard(): Promise<ApiResult<Cuenta[]>> {
  const result = await apiFetch<CuentaResumenDTO[]>("/api/v1/cuentas/dashboard")
  if (result.error) return result
  return {
    data: (result.data ?? []).map((c) => ({
      id: c.idCuenta,
      numeroCuenta: c.numeroCuenta,
      tipoCuenta: c.tipo,
      saldo: Number(c.saldo),
      estado: c.estado,
      permiteTransacciones: c.permiteTransacciones,
      etiquetaVisual: c.etiquetaVisual,
    })),
  }
}

// ── Transacciones ────────────────────────────────────────────────────────────

type MovimientoDTO = {
  fechaHora: string
  concepto: string
  monto: number
  saldoResultante: number
}

type TransaccionRespuestaDTO = {
  idTransaccion: number
  tipo: string
  monto: number
  saldoResultante: number
  estado: string
  fecha: string
  mensaje: string
}

export async function getTransacciones(idCuenta: number): Promise<ApiResult<Transaccion[]>> {
  const result = await apiFetch<MovimientoDTO[]>(`/api/v1/transacciones/cuenta/${idCuenta}`)
  if (result.error) return result
  return {
    data: (result.data ?? []).map((m, i) => ({
      id: i,
      fecha: m.fechaHora,
      concepto: m.concepto,
      tipo: m.concepto,
      monto: Number(m.monto),
    })),
  }
}

export async function getTransaccionesFiltro(
  idCuenta: number,
  fechaInicio: string,
  fechaFin: string
): Promise<ApiResult<Transaccion[]>> {
  const inicio = encodeURIComponent(`${fechaInicio}T00:00:00`)
  const fin = encodeURIComponent(`${fechaFin}T23:59:59`)
  const result = await apiFetch<MovimientoDTO[]>(
    `/api/v1/transacciones/cuenta/${idCuenta}/filtro?fechaInicio=${inicio}&fechaFin=${fin}`
  )
  if (result.error) return result
  return {
    data: (result.data ?? []).map((m, i) => ({
      id: i,
      fecha: m.fechaHora,
      concepto: m.concepto,
      tipo: m.concepto,
      monto: Number(m.monto),
    })),
  }
}

export async function depositar(idCuenta: number, monto: number) {
  const result = await apiFetch<TransaccionRespuestaDTO>("/api/v1/transacciones/depositar", {
    method: "POST",
    body: JSON.stringify({ idCuenta, monto }),
  })
  if (result.error) return result
  return { data: { nuevoSaldo: Number(result.data?.saldoResultante ?? 0) } }
}

export async function retirar(idCuenta: number, monto: number) {
  const result = await apiFetch<TransaccionRespuestaDTO>("/api/v1/transacciones/retirar", {
    method: "POST",
    body: JSON.stringify({ idCuenta, monto }),
  })
  if (result.error) return result
  return { data: { nuevoSaldo: Number(result.data?.saldoResultante ?? 0) } }
}

export async function transferir(idCuentaOrigen: number, numeroCuentaDestino: string, monto: number) {
  const result = await apiFetch<TransaccionRespuestaDTO>("/api/v1/transacciones/transferir", {
    method: "POST",
    body: JSON.stringify({ idCuentaOrigen, numeroCuentaDestino, monto }),
  })
  if (result.error) return result
  return { data: { nuevoSaldo: Number(result.data?.saldoResultante ?? 0) } }
}

// ── Seguridad ────────────────────────────────────────────────────────────────

export function bloquearCuenta(password: string) {
  return apiFetch<void>("/api/v1/cuentas/seguridad/bloquear", {
    method: "POST",
    body: JSON.stringify({ password }),
  })
}

export function desbloquearCuenta(password: string) {
  return apiFetch<void>("/api/v1/cuentas/seguridad/desbloquear", {
    method: "POST",
    body: JSON.stringify({ password }),
  })
}

// ── Registro ──────────────────────────────────────────────────────────────────

export function validarIdentidad(documento: string, fechaExpedicion: string) {
  return apiFetch<{ disponible: boolean }>("/api/v1/registro/validar-identidad", {
    method: "POST",
    body: JSON.stringify({ documento, fechaExpedicion }),
  })
}

export function registrar(data: RegistroData) {
  return apiFetch<{ numeroCuenta: string }>("/api/v1/registro", {
    method: "POST",
    body: JSON.stringify(data),
  })
}

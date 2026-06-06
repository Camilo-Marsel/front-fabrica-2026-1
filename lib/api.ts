const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080"
const GATEWAY_SECRET = process.env.NEXT_PUBLIC_GATEWAY_SECRET ?? ""

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
  genero: "MASCULINO" | "FEMENINO"
  nombre: string
  email: string
  direccion: string
  telefono: string
  username: string
  password: string
}

export type DepositoPendiente = {
  referenciaGateway: string
  fechaExpiracion: string
  segundosRestantes: number
  estado: string
}

export type TokenRetiro = {
  codigo: string
  monto: number
  segundosRestantes: number
}

export type TransferenciaInterbancaria = {
  idTransaccion: number
  referenciaExterna: string
  monto: number
  saldoResultante: number
  estado: string
  fecha: string
  mensaje: string
}

export type TransferenciaInternacional = {
  idTransfInt: number
  referenciaSwift: string
  montoUsd: number
  montoCop: number
  tasaCambio: number
  estado: string
  fecha: string
  mensaje: string
}

export type Extracto = {
  numeroCuentaEnmascarado: string
  tipoCuenta: string
  nombreTitular: string
  documento: string
  anio: number
  mes: number
  saldoInicial: number
  saldoFinal: number
  totalCreditos: number
  totalDebitos: number
  movimientos: Transaccion[]
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

export function getMiRol() {
  return apiFetch<{ rol: string }>("/api/v1/clientes/me/rol")
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

export function abrirCuenta(tipoCuenta: "AHORROS" | "CORRIENTE") {
  return apiFetch<CuentaResumenDTO>("/api/v1/cuentas/abrir", {
    method: "POST",
    body: JSON.stringify({ tipoCuenta }),
  })
}

export function cerrarCuenta(idCuenta: number, contrasena: string) {
  return apiFetch<{ mensaje: string }>("/api/v1/cuentas/cerrar", {
    method: "PATCH",
    body: JSON.stringify({ idCuenta, contrasena }),
  })
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

export function transferir(idCuentaOrigen: number, numeroCuentaDestino: string, monto: number) {
  return apiFetch<TransaccionRespuestaDTO>("/api/v1/transacciones/transferir", {
    method: "POST",
    body: JSON.stringify({ idCuentaOrigen, numeroCuentaDestino, monto }),
  })
}

// ── Depósito pendiente (flujo real del backend) ───────────────────────────────
// El usuario registra un depósito con referencia; el gateway lo confirma después.

export function registrarDepositoPendiente(
  numeroCuenta: string,
  monto: number,
  referenciaGateway?: string
) {
  const ref = referenciaGateway ?? `DEP-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`
  return apiFetch<DepositoPendiente>("/api/v1/transacciones/deposito-pendiente", {
    method: "POST",
    body: JSON.stringify({ referenciaGateway: ref, numeroCuenta, monto }),
  })
}

export function consultarDepositoPendiente(referencia: string) {
  return apiFetch<DepositoPendiente>(`/api/v1/transacciones/deposito-pendiente/${referencia}`)
}

// ── Token de retiro (flujo real del backend) ──────────────────────────────────
// El usuario genera un token OTP; lo usa en cajero/ventanilla.

export function generarTokenRetiro(idCuenta: number, monto: number) {
  return apiFetch<TokenRetiro>("/api/v1/token-retiro/generar", {
    method: "POST",
    body: JSON.stringify({ idCuenta, monto }),
  })
}

export function consultarTokenRetiro(codigo: string) {
  return apiFetch<{ codigo: string; estado: string; segundosRestantes: number }>(
    `/api/v1/token-retiro/${codigo}`
  )
}

// ── Transferencia interbancaria ───────────────────────────────────────────────

export type SolicitudInterbancaria = {
  idCuentaOrigen: number
  bancoDestino: string
  tipoCuentaDestino: string
  numeroCuentaDestino: string
  tipoDocumentoReceptor: string
  numeroDocumentoReceptor: string
  nombreReceptor: string
  monto: number
}

export function transferirInterbancario(data: SolicitudInterbancaria) {
  return apiFetch<TransferenciaInterbancaria>("/api/v1/transferencias/interbancarias", {
    method: "POST",
    body: JSON.stringify(data),
  })
}

export function consultarTransferenciaInterbancaria(idTransaccion: number) {
  return apiFetch<TransferenciaInterbancaria>(`/api/v1/transferencias/interbancarias/${idTransaccion}`)
}

// ── Transferencia internacional ───────────────────────────────────────────────

export type SolicitudInternacional = {
  idCuentaOrigen: number
  bancoDestino: string
  codigoSwift: string
  paisDestino: string
  tipoCuentaDestino: string
  ibanCuentaDestino: string
  tipoDocumentoReceptor: string
  numeroDocumentoReceptor: string
  nombreReceptor: string
  montoUsd: number
  tasaCambio: number
  moneda?: string
}

export function transferirInternacional(data: SolicitudInternacional) {
  return apiFetch<TransferenciaInternacional>("/api/v1/transferencias/internacionales", {
    method: "POST",
    body: JSON.stringify({ ...data, moneda: "USD" }),
  })
}

export function consultarTransferenciaInternacional(idTransfInt: number) {
  return apiFetch<TransferenciaInternacional>(`/api/v1/transferencias/internacionales/${idTransfInt}`)
}

// ── Extracto ──────────────────────────────────────────────────────────────────

export async function getExtracto(idCuenta: number, anio: number, mes: number): Promise<ApiResult<Extracto>> {
  const result = await apiFetch<{
    numeroCuentaEnmascarado: string
    tipoCuenta: string
    nombreTitular: string
    documento: string
    anio: number
    mes: number
    saldoInicial: number
    saldoFinal: number
    totalCreditos: number
    totalDebitos: number
    movimientos: MovimientoDTO[]
  }>(`/api/v1/extractos/${idCuenta}/${anio}/${mes}`)
  if (result.error) return result
  const d = result.data!
  return {
    data: {
      ...d,
      saldoInicial: Number(d.saldoInicial),
      saldoFinal: Number(d.saldoFinal),
      totalCreditos: Number(d.totalCreditos),
      totalDebitos: Number(d.totalDebitos),
      movimientos: (d.movimientos ?? []).map((m, i) => ({
        id: i,
        fecha: m.fechaHora,
        concepto: m.concepto,
        tipo: m.concepto,
        monto: Number(m.monto),
      })),
    },
  }
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

// ── Demo gateway (simula pasarela/cajero/red ACH) ────────────────────────────

async function gatewayFetch<T>(path: string, body: object, extraHeaders?: Record<string, string>): Promise<ApiResult<T>> {
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json", ...extraHeaders },
      body: JSON.stringify(body),
    })
    const data = await res.json().catch(() => null)
    if (!res.ok) return { error: data?.mensaje ?? data?.message ?? "Error inesperado", status: res.status }
    return { data: data as T }
  } catch {
    return { error: "No se pudo conectar con el servidor", status: 0 }
  }
}

export function confirmarDepositoDemo(numeroCuenta: string, monto: number, referenciaGateway: string) {
  return gatewayFetch<{ mensaje: string }>("/api/v1/depositos/notificacion", {
    numeroCuenta, monto, referenciaGateway, canalOrigen: "DEMO",
  })
}

export function procesarRetiroDemo(codigoToken: string, monto: number) {
  return gatewayFetch<{ mensaje: string }>("/api/v1/retiros/notificacion", { codigoToken, monto })
}

export function confirmarAchDemo(idTransaccion: number) {
  return gatewayFetch<TransferenciaInterbancaria>(
    `/api/v1/transferencias/interbancarias/${idTransaccion}/confirmacion-ach`,
    { observacion: "Confirmado modo demo" },
    { "X-Gateway-Secret": GATEWAY_SECRET }
  )
}

export function rechazarAchDemo(idTransaccion: number) {
  return gatewayFetch<TransferenciaInterbancaria>(
    `/api/v1/transferencias/interbancarias/${idTransaccion}/rechazo-ach`,
    { motivoRechazo: "Rechazado modo demo" },
    { "X-Gateway-Secret": GATEWAY_SECRET }
  )
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

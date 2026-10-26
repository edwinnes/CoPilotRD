# Aplicar la propuesta en un checkout real

El archivo externo `CoPilotRD-audit.patch` contiene un único commit de reparaciones sobre el snapshot de código de la base auditada. El snapshot Git local no debe subirse como si fuera la historia completa del repositorio. Para conservar la historia, los assets y los árboles no recuperados, aplicar el parche en un checkout real:

```sh
git clone https://github.com/edwinnes/CoPilotRD.git
cd CoPilotRD
git switch --create audit/security-hardening-2026-10-26 7fe70fe3a1b87e0182cc3265196fe5e8fd640c26
git am /ruta/CoPilotRD-audit.patch
```

Revisar el diff, completar las verificaciones de `docs/VALIDATION.md` y usar `docs/PR.md` para abrir un PR **borrador** con base `produccion-babel-configuracion`. No hacer push de `main`, no fusionar ni desplegar esta propuesta como una funcionalidad de autenticación o pagos terminada.

La aplicación del parche se verifica localmente contra los archivos originales recuperados. Eso comprueba los contextos del diff; no equivale a una compilación ni a validación de los assets/binarios del repositorio completo.

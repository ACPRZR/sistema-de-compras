# 🚀 GUÍA RÁPIDA: Testing Sistema PIN

## ✅ PASOS PARA PROBAR EL SISTEMA

### 1️⃣ **Verificar que Backend y Frontend están corriendo**

- ✅ Backend: `http://localhost:3001/health` debe responder
- ✅ Frontend: `http://localhost:3000` debe cargar

---

### 2️⃣ **Crear una NUEVA orden con aprobador**

1. Abre `http://localhost:3000`
2. Haz clic en **"Nueva Orden"**
3. **Llena TODOS los campos requeridos:**
   - Fecha de Requerimiento
   - Categoría de Compra
   - Tipo de Orden: Standard
   - **APROBADOR (IMPORTANTE):** Selecciona **"Juan Colqui Solorzano - Presidente"**
   - Proveedor (crea uno nuevo si es necesario)
   - Al menos 1 item

4. **ANTES de guardar, abre la consola (F12)** y verifica:
   ```javascript
   // Esto debería mostrar el formData con aprobadorId
   console.log('Test aprobador:', document.querySelector('[name="aprobadorId"]')?.value);
   ```

5. Haz clic en **"Guardar y Generar Orden"**

6. **En la consola, busca:**
   - `📤 Enviando orden al backend`
   - `👤 Aprobador: { aprobadorId: "1", ... }`
   
   Si `aprobadorId` es `undefined` o `null` → **PROBLEMA EN FRONTEND**

---

### 3️⃣ **Verificar que la orden se guardó con aprobador**

En una terminal nueva:

```bash
node -e "const {Pool}=require('pg');const pool=new Pool({host:'localhost',port:5432,database:'ordenes_compra',user:'postgres',password:'alvaro'});pool.query('SELECT id, numero_oc, estado_id, aprobador_id FROM ordenes_compra.ordenes_compra ORDER BY id DESC LIMIT 1').then(r=>{console.table(r.rows);pool.end();})"
```

**Resultado esperado:**
```
┌─────────┬────┬───────────────┬───────────┬──────────────┐
│ (index) │ id │ numero_oc     │ estado_id │ aprobador_id │
├─────────┼────┼───────────────┼───────────┼──────────────┤
│ 0       │ 3  │ 'OC-2025-008' │ 1         │ 1            │ ← DEBE TENER VALOR
└─────────┴────┴───────────────┴───────────┴──────────────┘
```

Si `aprobador_id` es **null** → El frontend NO está enviando el dato.

---

### 4️⃣ **Generar link de WhatsApp**

1. Ve a **"Órdenes Pendientes"**
2. Busca tu orden recién creada
3. Haz clic en el ícono del **gráfico (📊)**
4. Haz clic en **"Generar Link de WhatsApp"**
5. Copia el link que aparece

---

### 5️⃣ **Probar aprobación con PIN**

1. **Abre el link** en el navegador (puede ser la misma ventana)
2. Deberías ver la orden completa
3. Haz clic en **"Aprobar"**
4. Se abrirá un modal pidiendo el **PIN**
5. Ingresa: **1234**
6. Haz clic en **"Confirmar"**

**Resultado esperado:**
- ✅ Mensaje: "Orden aprobada exitosamente"
- ✅ La orden cambia a estado "Aprobada"

---

## 🔴 PROBLEMAS COMUNES

### Error: "Esta orden no tiene un aprobador asignado"

**Causa:** `aprobador_id` es `null` en la base de datos.

**Solución:**

1. Verifica que el selector de aprobador aparece en el formulario
2. Asegúrate de seleccionar un aprobador ANTES de guardar
3. Verifica en la consola que `formData.aprobadorId` tiene valor
4. Si no tiene valor, el problema está en `InformacionGeneral.jsx`

---

### Error: "PIN incorrecto"

**Causa:** El PIN no coincide.

**Solución:**
- PIN correcto: **1234**
- Si cambió, verifica en la base de datos:
  ```sql
  SELECT nombre_completo, cargo, es_aprobador FROM ordenes_compra.usuarios WHERE es_aprobador = true;
  ```

---

### Error: "Esta orden ya fue procesada"

**Causa:** La orden está en un estado diferente a "Creada" (1) o "En Revisión" (2).

**Solución:**
- Crea una NUEVA orden
- O verifica el estado con:
  ```sql
  SELECT id, numero_oc, estado_id FROM ordenes_compra.ordenes_compra WHERE id = X;
  ```

---

## 📊 COMANDOS ÚTILES DE DEBUG

### Ver última orden creada:
```bash
node -e "const {Pool}=require('pg');const pool=new Pool({host:'localhost',port:5432,database:'ordenes_compra',user:'postgres',password:'alvaro'});pool.query('SELECT * FROM ordenes_compra.ordenes_compra ORDER BY id DESC LIMIT 1').then(r=>{console.log(JSON.stringify(r.rows[0], null, 2));pool.end();})"
```

### Ver aprobadores registrados:
```bash
node -e "const {Pool}=require('pg');const pool=new Pool({host:'localhost',port:5432,database:'ordenes_compra',user:'postgres',password:'alvaro'});pool.query('SELECT id, nombre_completo, cargo, dni, es_aprobador FROM ordenes_compra.usuarios WHERE es_aprobador = true').then(r=>{console.table(r.rows);pool.end();})"
```

### Actualizar manualmente el aprobador_id de una orden:
```bash
node -e "const {Pool}=require('pg');const pool=new Pool({host:'localhost',port:5432,database:'ordenes_compra',user:'postgres',password:'alvaro'});pool.query('UPDATE ordenes_compra.ordenes_compra SET aprobador_id = 1 WHERE id = NUMERO_DE_ORDEN').then(r=>{console.log('✅ Actualizado');pool.end();})"
```
*Reemplaza NUMERO_DE_ORDEN con el ID de tu orden*

---

## 🎯 CHECKLIST DE VERIFICACIÓN

- [ ] Backend corriendo en puerto 3001
- [ ] Frontend corriendo en puerto 3000
- [ ] Módulo `bcrypt` instalado
- [ ] Base de datos con tabla `usuarios` tiene aprobadores
- [ ] Campo `aprobador_id` existe en tabla `ordenes_compra`
- [ ] Selector de aprobador visible en formulario "Nueva Orden"
- [ ] Console.log muestra `aprobadorId` con valor al guardar
- [ ] Orden guardada en DB tiene `aprobador_id` != null
- [ ] Link de WhatsApp genera correctamente
- [ ] Modal de PIN aparece al intentar aprobar
- [ ] PIN 1234 funciona correctamente

---

## 💡 SI NADA FUNCIONA

**Actualiza manualmente una orden existente para testing:**

```javascript
// En la consola del navegador, después de crear una orden:
fetch('http://localhost:3001/api/ordenes', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({
    // Copia todos los datos de una orden existente
    // Pero agrega: aprobador_id: 1
  })
})
```

O desde terminal:
```bash
node -e "const {Pool}=require('pg');const pool=new Pool({host:'localhost',port:5432,database:'ordenes_compra',user:'postgres',password:'alvaro'});pool.query('UPDATE ordenes_compra.ordenes_compra SET aprobador_id = 1 WHERE id = (SELECT id FROM ordenes_compra.ordenes_compra ORDER BY id DESC LIMIT 1)').then(r=>{console.log('✅ Última orden actualizada con aprobador_id=1');pool.end();})"
```

Esto asigna el aprobador a la última orden creada.


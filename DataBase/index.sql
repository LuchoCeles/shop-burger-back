USE shopdb;

-- ===========================
-- PRODUCTO
-- ===========================

DROP INDEX IF EXISTS idx_productos_estado ON Productos;
CREATE INDEX idx_productos_estado ON Productos(estado);

DROP INDEX IF EXISTS idx_adicionales_estado ON Adicionales;
CREATE INDEX idx_adicionales_estado ON Adicionales(estado);

DROP INDEX IF EXISTS idx_axp_producto_adicional ON AdicionalesXProductos;
CREATE INDEX idx_axp_producto_adicional ON AdicionalesXProductos(idProducto, idAdicional);

DROP INDEX IF EXISTS idx_gxp_producto_guarnicion ON GuarnicionesXProducto;
CREATE INDEX idx_gxp_producto_guarnicion ON GuarnicionesXProducto(idProducto, idGuarnicion);

DROP INDEX IF EXISTS idx_pxt_producto_precio ON ProductosXTam;
CREATE INDEX idx_pxt_producto_precio ON ProductosXTam(idProducto, precio);

-- ===========================
-- PEDIDO
-- ===========================

DROP INDEX IF EXISTS idx_pedidos_estado ON Pedidos;
CREATE INDEX idx_pedidos_estado ON Pedidos(estado);

DROP INDEX IF EXISTS idx_pedidos_fecha ON Pedidos;
CREATE INDEX idx_pedidos_fecha ON Pedidos(createdAt);

DROP INDEX IF EXISTS idx_axpxp_producto_pedido ON AdicionalesXProductosXPedidos;
CREATE INDEX idx_axpxp_producto_pedido ON AdicionalesXProductosXPedidos(idProductoXPedido);

DROP INDEX IF EXISTS idx_pxp_pedido ON ProductosXPedido;
CREATE INDEX idx_pxp_pedido ON ProductosXPedido(idPedido);

DROP INDEX IF EXISTS idx_pxt_producto ON ProductosXTam;
CREATE INDEX idx_pxt_producto ON ProductosXTam(idProducto);

DROP INDEX IF EXISTS idx_pedidos_estado_fecha ON Pedidos;
CREATE INDEX idx_pedidos_estado_fecha ON Pedidos(estado, createdAt DESC);

DROP INDEX IF EXISTS idx_pxp_pedido_producto ON ProductosXPedido;
CREATE INDEX idx_pxp_pedido_producto ON ProductosXPedido(idPedido, idProducto);

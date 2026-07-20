/**
 * Data compatibility migrations.
 * Bump compatibility.version when schema or storage layout changes.
 *
 * @param {import("./app-main").AppKernel} kernel
 */
module.exports = kernel => {
  const version = $cache.get("compatibility.version") ?? 0

  if (version < 1) {
    kernel.logger.info("Running compatibility migration: ver1")
    $cache.set("compatibility.version", 1)
  }
}

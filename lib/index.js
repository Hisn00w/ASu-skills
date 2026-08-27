// DSH bundle entry for the ASu-skills plugin package.
// Two wiring paths exist and never run in the same session:
// - Boot: cordis.patch.yml inserts the filesystem provider row directly
//   (the archify-style bundle-patch path); this module is not loaded then.
// - Hot install (profile tooling calls loader.create on this package): this
//   module is a valid cordis plugin and mounts the same provider entry itself,
//   so the five skills appear without a restart.
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

export const name = 'asu-skills';

const PROVIDER = '@deepseek-ai/dsh-skill-filesystem';

export function apply(ctx, config = {}) {
  const skillRoot = config.bundledSkillDir
    ?? join(dirname(fileURLToPath(import.meta.url)), '..', 'skills');
  ctx.effect(() => {
    let entryId;
    let disposed = false;
    void ctx.loader.create({
      name: PROVIDER,
      config: {
        providerName: 'asu-skills',
        includeDefaultRoots: false,
        bundledSkillDir: skillRoot,
      },
    }).then((id) => {
      if (disposed) ctx.loader.remove(id);
      else entryId = id;
    }).catch((error) => {
      console.error(`Failed to load ${PROVIDER} for ${name}.`, error);
    });
    return () => {
      disposed = true;
      if (entryId) ctx.loader.remove(entryId);
    };
  });
}

import { createWorkerAddon, runCli } from '@watchedcom/sdk';
import nasa from './nasa';

const nasaAddon = createWorkerAddon({
  id: 'nasa',
  name: 'Nasa Videos',
  version: '0.0.1',
  itemTypes: ['channel'],
  defaultDirectoryOptions: {
    imageShape: 'landscape',
    displayName: true,
  },
  defaultDirectoryFeatures: {
    search: { enabled: true },
  },
  dashboards: [
    {
      id: '',
      name: 'Nasa Videos',
    },
  ],
});

nasaAddon.registerActionHandler('directory', async (input, ctx) => {
  await ctx.requestCache([input.search, input.filter, input.cursor]);
  return await nasa.getVideos(input);
});

nasaAddon.registerActionHandler('item', async (input, ctx) => {
  return await nasa.getVideo(input);
});

// nasaAddon.registerActionHandler('source', async (input, ctx) => {
//   return [];
// });

runCli([nasaAddon], { singleMode: true });

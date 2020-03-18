import { createWorkerAddon, WorkerHandlers } from '@watchedcom/sdk';
import nasa from './nasa';

export const nasaAddon = createWorkerAddon({
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

// input {id, search, filter, page}
const directoryHandler: WorkerHandlers['directory'] = async (input: any, ctx) => {
  return await nasa.getVideos(input);
};

/*
const itemHandler: WorkerHandlers['item'] = async (input: any, ctx) => {
  return await nasa.getChannel(input);
};

const sourceHandler: WorkerHandlers['source'] = async (input, ctx) => {
  return [];
};
*/

nasaAddon.registerActionHandler('directory', directoryHandler);

//nasaAddon.registerActionHandler('item', itemHandler);

//nasaAddon.registerActionHandler('source', sourceHandler);

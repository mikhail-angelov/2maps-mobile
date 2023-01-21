import ReactNativeForegroundService from '@supersami/rn-foreground-service';

const TASK_ID = '2MAPS_TASK';
let globalForegroundCallback: ((()=>void) | null) = null;

const update = async () => {
  console.log('ReactNativeForegroundService on update');
  globalForegroundCallback && globalForegroundCallback()
};

export const register = () => {
  ReactNativeForegroundService.register();
  ReactNativeForegroundService.add_task(() => update(), {
    delay: 10000,
    onLoop: true,
    taskId: TASK_ID,
    onError: e => console.log(`Error ReactNativeForegroundService:`, e),
  });
};

export const startTask = async (cb: ()=>void) => {
  try {
    await ReactNativeForegroundService.start({
      id: 1234567,
      title: '2Maps GPS tracking',
      message: 'tracking gps track...',
      icon: 'ic_launcher',
      setOnlyAlertOnce: 'true',
      color: '#000000',
    });
    globalForegroundCallback = cb
  } catch (e) {
    console.log('error to star foreground task', e);
  }
};

export const stopTask = () => {
  globalForegroundCallback = null
  ReactNativeForegroundService.stopAll();
};

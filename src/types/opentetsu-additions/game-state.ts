export type DriveMode = 'Normal' | 'Free' | 'RTA';

// Lower caps used on purpose.
export type RailwayTitle = 'tatehama' | 'others';
export type GameStatus = 'inactive' | 'running' | 'paused' | 'result';

export type GameScreen =
  | 'MainGame'
  | 'MainGame_Pause'
  | 'MainGame_Loading'
  | 'Menu'
  | 'Result'
  | 'Title'
  | 'Other'
  | 'NotRunningGame';

export type CrewType = 'Driver' | 'Conductor';

export interface GameState {
  mode?: DriveMode;
  screen?: GameScreen;
  type?: CrewType;
}

export type fallBlockAction =
  { actionType: 'ACTION_MOVE_DOWN' } |
  { actionType: 'ACTION_MOVE_LEFT' } |
  { actionType: 'ACTION_MOVE_RIGHT' } |
  {
    actionType: 'SET_COLLISION_OBJECT', payload: {
      fieldState: number[][]
    }
  } |
  { actionType: 'NEW_FALL_BLOCK' } |
  { actionType: 'GAMEOVER' } |
  { actionType: 'RESTART' } |
  { actionType: 'PAUSE' } |
  {
    actionType: 'SCORE', payload: {
      diff: number
    }
  } |
  { actionType: 'START' }


export type fallBlockState = {

  // player
  x: number,
  y: number,
  num: number,
  isFall: boolean,
  collision: boolean,
  gameover: boolean,
  pause: boolean,
  preScore: number,
  score: number,
  nextNum: number,
  start: boolean
}

export function fallBlockReducer(state: fallBlockState, action: fallBlockAction) {
  const nums = [2, 4, 8, 16, 32]
  switch (action.actionType) {
    case 'ACTION_MOVE_DOWN': return {
      ...state,
      y: state.y + 1,
      isFall: true,
      collision: false
    }
    case 'ACTION_MOVE_LEFT': return {
      ...state,
      x: state.x - 1,
      isFall: true,
      collision: false
    }
    case 'ACTION_MOVE_RIGHT': return {
      ...state,
      x: state.x + 1,
      isFall: true,
      collision: false
    }
    case 'SET_COLLISION_OBJECT':
      if (state.y !== 5) {
        //state.y に +1した値のfieldのnum
        if (action.payload.fieldState[state.y + 1][state.x] === nums[state.num]) {
          return {
            ...state,
            isFall: false,
            collision: true
          }
        }
      }
      return {
        ...state,
        isFall: false,
        collision: true,
      }
    case 'NEW_FALL_BLOCK':
      const nextRandomNumber = Math.floor(Math.random() * 5) // 0〜4のランダムな整数を生成

      return {
        ...state,
        x: state.x,
        y: 0,
        num: state.nextNum,
        isFall: true,
        collision: false,
        gameover: false,
        nextNum: nextRandomNumber
      }
    case 'GAMEOVER': return {
      ...state,
      gameover: true
    }
    case 'RESTART':
      const randomNumber2 = Math.floor(Math.random() * 5) // 0〜4のランダムな整数を生成
      return {
        ...state,
        x: 2,
        y: 0,
        num: randomNumber2,
        isFall: true,
        preScore: state.score,
        collision: false,
        gameover: false,
        start: state.gameover ? false : true,
        score: 0
      }
    case 'PAUSE': return {
      ...state,
      isFall: true,
      collision: false,
      gameover: false,
      pause: !state.pause ? true : false
    }
    case 'SCORE': return {
      ...state,
      score: state.score + action.payload.diff,
      preScore: state.preScore > state.score ? state.preScore : state.score + action.payload.diff
    }
    case 'START': return {
      ...state,
      start: !state.start ? true : false
    }
  }

  return state
}

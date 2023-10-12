

export type fieldAction =
  {
    actionType: 'SET_BLOCK', payload: {
      x: number, y: number, num: number
    }
  } |
  {
    actionType: 'SET_CALCED_FIELD', payload: {
      culcedField: number[][]
    }
  } |
  { actionType: 'RESET_FIELD' }

export function fieldReducer(state: number[][], action: fieldAction): number[][] {
  // console.log(state);

  switch (action.actionType) {
    case 'SET_BLOCK': return (
      state.map((y, yIndex) => {
        return y.map((x, xIndex) => {
          if (xIndex === action.payload.x && yIndex === action.payload.y) {
            return action.payload.num
          } else {
            return x
          }
        })
      })
    )
    case 'SET_CALCED_FIELD': return (
      action.payload.culcedField
    )
    case 'RESET_FIELD': return ([
      [0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0]]
    )
  }
  return state
}

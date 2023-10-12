import { useEffect, useRef } from 'react'
import { fallBlockAction, fallBlockState } from './fallBlockReducer'
import { fieldAction } from './fieldReducer'

export default function Timer() {

  const intervalCallback = () => {
  }

  const intervalCallbackRef = useRef(intervalCallback)

  useEffect(() => {
    intervalCallbackRef.current = intervalCallback
  })

  useEffect(() => {
    const timer = setInterval(() => {
      intervalCallbackRef.current()
    }, 100)

    return () => {
      clearInterval(timer)
    }
  }, [])
}

export function doIntervalProc(
  fallBlockDispatch: React.Dispatch<fallBlockAction>,
  fieldDispatch: React.Dispatch<fieldAction>,
  fallBlockState: fallBlockState,
  fieldState: number[][]) {
  const blockNextY = fallBlockState.y + 1
  const num = [2, 4, 8, 16, 32]

  // fieldの一番上にすでにブロックがいる = 結合できない場合にGame Over!
  if (fieldState[0].some(num => num !== 0)) {
    fallBlockDispatch({ actionType: 'GAMEOVER' })
    return
  }

  if (!fallBlockState.start) {
    return
  }

  // Game Overなら以降の処理をしない
  if (fallBlockState.gameover) {
    return
  }

  // ポーズ中なら以降の処理をしない
  if (fallBlockState.pause) {
    return
  }

  // 現在のブロックの位置が一番下 or 次落ちる位置が0じゃない = なにかブロックがいる場合
  // SET_COLLISION_OBJECT でisFallをfalseにして、落下を停止し、次のブロックを生成する
  if (fallBlockState.y === fieldState.length - 1 || fieldState[blockNextY][fallBlockState.x] !== 0) {
    fallBlockDispatch({ actionType: 'SET_COLLISION_OBJECT', payload: { fieldState } })


    // isFallがtrueじゃない = 今ブロックが落下していない場合
    if (!fallBlockState.isFall) {
      fieldDispatch({ actionType: 'SET_BLOCK', payload: { x: fallBlockState.x, y: fallBlockState.y, num: num[fallBlockState.num] } })

      // ここから

      let copyField = JSON.parse(JSON.stringify(fieldState)) as number[][]
      copyField[fallBlockState.y][fallBlockState.x] = num[fallBlockState.num]

      // 衝突判定
      copyField = doOkuSpecial(copyField, fallBlockState.x, fallBlockState.y)

      let diff = 0;
      for (let i = 0; i < fieldState.length; i++) {
        for (let j = 0; j < fieldState[i].length; j++) {
          if (fieldState[i][j] !== copyField[i][j]) {
            diff += copyField[i][j];
          }
        }
      }
      // console.log(diff);

      fallBlockDispatch({ actionType: 'SCORE', payload: { diff } })

      fieldDispatch({ actionType: 'SET_CALCED_FIELD', payload: { culcedField: copyField } })

      // (この条件が果たして必要なのかはわからないが)game overがfalseならば、次のブロックを生成する。
      if (!fallBlockState.gameover && copyField[0][fallBlockState.x] === 0) {
        fallBlockDispatch({ actionType: 'NEW_FALL_BLOCK' })
      }
    }
  } else {
    // これまでのすべての条件に引っかからなかった場合、ブロックを１つ下へ落下させる。
    if (!fallBlockState.gameover) {
      fallBlockDispatch({ actionType: 'ACTION_MOVE_DOWN' })
    }
  }
}

function doOkuSpecial(copyField: number[][], fallBlockX: number, fallBlockY: number): number[][] {
  let flg = true
  let count = 0
  let wkFallBlockY = fallBlockY

  while (flg) {
    // 意図しない無限ループの安全弁
    count++
    if (count > 200) {
      dump(copyField, fallBlockX, wkFallBlockY)
      throw new Error('無限ループだよ')
    }

    // 操作中のブロックは結合すると数値が変化するため
    // 更新前のブロック値を退避しておく
    const orgFallBlockNum = copyField[wkFallBlockY][fallBlockX]

    // デバッグ出力
    dump(copyField, fallBlockX, wkFallBlockY)

    // 以下、上下左右を探査してブロックを結合する

    // 上方向に同値のブロックが存在する限り結合する
    for (let i = 1; i <= copyField.length; i++) {
      if (wkFallBlockY - i >= 0 &&
        copyField[wkFallBlockY - i][fallBlockX] === orgFallBlockNum) {
        copyField[wkFallBlockY - i][fallBlockX] = 0
        copyField[wkFallBlockY][fallBlockX] = copyField[wkFallBlockY][fallBlockX] * 2

        // デバッグ出力
        dump(copyField, fallBlockX, wkFallBlockY)
      } else {
        break
      }
    }

    // 左方向に同値のブロックが存在する限り結合する
    for (let i = 1; i <= copyField[wkFallBlockY].length; i++) {
      if (fallBlockX - i >= 0 &&
        copyField[wkFallBlockY][fallBlockX - i] === orgFallBlockNum) {
        copyField[wkFallBlockY][fallBlockX - i] = 0
        copyField[wkFallBlockY][fallBlockX] = copyField[wkFallBlockY][fallBlockX] * 2

        // デバッグ出力
        dump(copyField, fallBlockX, wkFallBlockY)
      } else {
        break
      }
    }

    // 右方向に同値のブロックが存在する限り結合する
    for (let i = 1; i <= copyField[wkFallBlockY].length; i++) {
      if (fallBlockX + i < copyField[wkFallBlockY].length &&
        copyField[wkFallBlockY][fallBlockX + i] === orgFallBlockNum) {
        copyField[wkFallBlockY][fallBlockX + i] = 0
        copyField[wkFallBlockY][fallBlockX] = copyField[wkFallBlockY][fallBlockX] * 2

        // デバッグ出力
        dump(copyField, fallBlockX, wkFallBlockY)
      } else {
        break
      }
    }

    // 下方向に同値のブロックが存在する限り結合する
    for (let i = 1; i <= copyField.length; i++) {
      if (wkFallBlockY + i < copyField.length &&
        copyField[wkFallBlockY + i][fallBlockX] === orgFallBlockNum) {
        copyField[wkFallBlockY + i][fallBlockX] = 0
        copyField[wkFallBlockY][fallBlockX] = copyField[wkFallBlockY][fallBlockX] * 2

        // デバッグ出力
        dump(copyField, fallBlockX, wkFallBlockY)
      } else {
        break
      }
    }

    for (let yIndex = 0; yIndex < copyField.length; yIndex++) {
      for (let xIndex = 0; xIndex < copyField[yIndex].length; xIndex++) {
        if (copyField[yIndex][xIndex] !== 0) {
          if (yIndex + 1 < copyField.length && copyField[yIndex + 1][xIndex] === 0) {
            copyField[yIndex + 1][xIndex] = copyField[yIndex][xIndex]
            copyField[yIndex][xIndex] = 0

            // 落下対象が操作中のブロックならば、操作中ブロックのy座標も最新化する
            if (fallBlockX === xIndex && yIndex === wkFallBlockY) {
              wkFallBlockY++
            }

            // デバッグ出力
            dump(copyField, fallBlockX, wkFallBlockY)

            // 上段が空洞化した可能性があるので、上段かつ、1列手前からリトライ
            yIndex--
            if (yIndex < 0) {
              yIndex = 0
            }
            xIndex--
          }
        }
      }
    }

    // 終了条件
    // 上下左右に結合するブロックが存在しない場合は処理を終了する
    if (
      // 上下左右ブロックあり条件のNOT、つまりブロックなし
      !(
        //上段に同値のブロックあり
        (
          wkFallBlockY - 1 >= 0 &&
          copyField[wkFallBlockY - 1][fallBlockX] === copyField[wkFallBlockY][fallBlockX]
        ) ||
        // 下段に同値のブロックあり
        (
          wkFallBlockY + 1 < copyField.length &&
          copyField[wkFallBlockY + 1][fallBlockX] === copyField[wkFallBlockY][fallBlockX]
        ) ||
        // 右方向に同値のブロックあり
        (
          fallBlockX + 1 < copyField[wkFallBlockY].length &&
          copyField[wkFallBlockY][fallBlockX + 1] === copyField[wkFallBlockY][fallBlockX]
        ) ||
        // 左方向に同値のブロックあり
        (
          fallBlockX - 1 >= 0 &&
          copyField[wkFallBlockY][fallBlockX - 1] === copyField[wkFallBlockY][fallBlockX]
        )
      )
    ) {
      // ブロックが存在しないので終了
      flg = false
    }
  }

  // 以下、左右上下から結合可能なブロックの存在を探査する。
  // 一つ先読み評価することで、隣接するブロックを結合する必要性を判断。

  // 左とさらに左
  if (fallBlockX - 2 >= 0 &&
    copyField[wkFallBlockY][fallBlockX - 1] === copyField[wkFallBlockY][fallBlockX - 2] &&
    copyField[wkFallBlockY][fallBlockX - 2] !== 0) {
    return doOkuSpecial(copyField, fallBlockX - 1, wkFallBlockY)
  }

  // 左と左上
  if (fallBlockX - 1 >= 0 &&
    wkFallBlockY - 1 >= 0 &&
    copyField[wkFallBlockY][fallBlockX - 1] === copyField[wkFallBlockY - 1][fallBlockX - 1] &&
    copyField[wkFallBlockY - 1][fallBlockX - 1] !== 0) {
    return doOkuSpecial(copyField, fallBlockX - 1, wkFallBlockY)
  }

  // 左と左下
  if (fallBlockX - 1 >= 0 &&
    wkFallBlockY + 1 < copyField.length &&
    copyField[wkFallBlockY][fallBlockX - 1] === copyField[wkFallBlockY + 1][fallBlockX - 1] &&
    copyField[wkFallBlockY + 1][fallBlockX - 1] !== 0) {
    return doOkuSpecial(copyField, fallBlockX - 1, wkFallBlockY)
  }

  // 右とさらに右
  if (fallBlockX + 2 < copyField[wkFallBlockY].length &&
    copyField[wkFallBlockY][fallBlockX + 1] === copyField[wkFallBlockY][fallBlockX + 2] &&
    copyField[wkFallBlockY][fallBlockX + 2] !== 0) {
    return doOkuSpecial(copyField, fallBlockX + 1, wkFallBlockY)
  }

  // 右と右上
  if (fallBlockX + 1 < copyField[wkFallBlockY].length &&
    wkFallBlockY - 1 >= 0 &&
    copyField[wkFallBlockY][fallBlockX + 1] === copyField[wkFallBlockY - 1][fallBlockX + 1] &&
    copyField[wkFallBlockY - 1][fallBlockX + 1] !== 0) {
    return doOkuSpecial(copyField, fallBlockX + 1, wkFallBlockY)
  }

  // 右と右下
  if (fallBlockX + 1 < copyField[wkFallBlockY].length &&
    wkFallBlockY + 1 < copyField.length &&
    copyField[wkFallBlockY][fallBlockX + 1] === copyField[wkFallBlockY + 1][fallBlockX + 1] &&
    copyField[wkFallBlockY + 1][fallBlockX + 1] !== 0) {
    return doOkuSpecial(copyField, fallBlockX + 1, wkFallBlockY)
  }

  // 上とさらに上
  if (wkFallBlockY - 2 >= 0 &&
    copyField[wkFallBlockY - 1][fallBlockX] === copyField[wkFallBlockY - 2][fallBlockX] &&
    copyField[wkFallBlockY - 2][fallBlockX] !== 0) {
    return doOkuSpecial(copyField, fallBlockX, wkFallBlockY - 1)
  }

  // 下とさらに下
  if (wkFallBlockY + 2 < copyField.length &&
    copyField[wkFallBlockY + 1][fallBlockX] === copyField[wkFallBlockY + 2][fallBlockX] &&
    copyField[wkFallBlockY + 2][fallBlockX] !== 0) {
    return doOkuSpecial(copyField, fallBlockX, wkFallBlockY + 1)
  }
  return copyField
}

export function restart(
  fallBlockDispatch: React.Dispatch<fallBlockAction>,
  fieldDispatch: React.Dispatch<fieldAction>,
  fallBlockState: fallBlockState) {
  fallBlockDispatch({ actionType: 'RESTART' })
  fieldDispatch({ actionType: 'RESET_FIELD' })
}

export function pause(
  fallBlockDispatch: React.Dispatch<fallBlockAction>,
  fallBlockState: fallBlockState
) {
  fallBlockDispatch({ actionType: 'PAUSE' })
}

export function start(
  fallBlockDispatch: React.Dispatch<fallBlockAction>,
  fallBlockState: fallBlockState
) {
  fallBlockDispatch({ actionType: 'START' })

}

export function doKeydownProc(
  dispatch: React.Dispatch<fallBlockAction>,
  e: KeyboardEvent,
  state: fallBlockState,
  fieldState: number[][]) {
  const blockNextY = state.y + 1
  const blockNextX = state.x + 1
  const blockPrevX = state.x - 1

  if (state.gameover) {
    return
  }
  if (e.code === 'ArrowDown') {
    if (state.y === 5 || fieldState[blockNextY][state.x] !== 0) {
      return
    }
    dispatch({ actionType: 'ACTION_MOVE_DOWN' })

  } else if (e.code === 'ArrowLeft') {
    if (state.x === 0 || fieldState[state.y][blockPrevX] !== 0) {
      return
    }
    dispatch({ actionType: 'ACTION_MOVE_LEFT' })
  } else if (e.code === 'ArrowRight') {
    if (state.x === 4 || fieldState[state.y][blockNextX] !== 0) {
      return
    }
    dispatch({ actionType: 'ACTION_MOVE_RIGHT' })
  }
}

function dump(copyField: number[][], fallBlockX: number, fallBlockY: number) {
  console.log('================' + fallBlockX + '/' + fallBlockY)
  console.log(JSON.parse(JSON.stringify(copyField)))
}

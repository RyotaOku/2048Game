import { useState, useEffect, useReducer, useRef, CSSProperties } from 'react'
import { doIntervalProc, doKeydownProc, restart, pause, start } from './actioncreator'
import Style from '@/styles/2048Game.module.css'
import { fallBlockReducer } from './fallBlockReducer'
import { fieldReducer } from './fieldReducer'

export default function Game2048() {
  useEffect(() => {
    if (num[state.num] === 0) {
      fallBlockDispatch({ actionType: 'NEW_FALL_BLOCK' })
    }
  }, [])

  const [state, fallBlockDispatch] = useReducer(fallBlockReducer, {
    x: 2,
    y: 0,
    num: 0,

    isFall: true,
    collision: false,
    gameover: false,
    pause: false,
    preScore: 0,
    score: 0,
    nextNum: 0,
    start: false
  })

  const [fieldState, fieldDispatch] = useReducer(fieldReducer, [
    [0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0],
  ])

  const [soundError, setSoundError] = useState('STOPPED')

  const intervalCallback = () => {
    doIntervalProc(fallBlockDispatch, fieldDispatch, state, fieldState)
  }

  const keydownCallback = (e: KeyboardEvent) => {
    doKeydownProc(fallBlockDispatch, e, state, fieldState)
  }

  const intervalCallbackRef = useRef(intervalCallback)
  const keydownCallbackRef = useRef(keydownCallback)

  useEffect(() => {
    intervalCallbackRef.current = intervalCallback
    keydownCallbackRef.current = keydownCallback
  })

  useEffect(() => {
    let speed = 800
    switch (Math.floor(state.score / 500)) {
      case 0: // scoreが200未満の場合
        break;
      case 1: // scoreが200以上の場合
        speed = 750;
        break;
      case 2: // scoreが400以上の場合
        speed = 700;
        break;
      case 3: // scoreが600以上の場合
        speed = 650;
        break;
      case 4: // scoreが800以上の場合
        speed = 600;
        break;
      case 5: // scoreが1000以上の場合
        speed = 550;
        break;
      default: // それ以上の場合
        speed = 500;
        break;
    }
    const timer = setInterval(() => {
      intervalCallbackRef.current()
    }, speed)

    const callback = (e: KeyboardEvent) => {
      keydownCallbackRef.current(e)
    }
    window.addEventListener('keydown', callback)

    return () => {
      clearInterval(timer)
      window.removeEventListener('keydown', callback)
    }
  }, [state.score])

  const num = [2, 4, 8, 16, 32]

  const [gameMode, setGameMode] = useState({
    gameMode: ''
  })

  const [hintState, setHintState] = useState({
    isShowHint: false
  })

  const [count, setCount] = useState(0);
  const [startX, setStartX] = useState(0);
  const [moveX, setMoveX] = useState(0);
  const [direction, setDirection] = useState('');
  const [currentDirection, setCurrentDirection] = useState('');

  useEffect(() => {
    const handleMouseMove = (event: any) => {
      window.addEventListener('mouseleave', function () {
        setCount(0);
      });

      if (!startX) {
        setStartX(event.clientX);
        return;
      }

      setMoveX(event.clientX - startX);

      if (Math.abs(moveX) >= 500) {
        const newDirection = moveX > 0 ? 'right' : 'left';

        if (count === 3 && gameMode.gameMode !== 'USSR' && newDirection !== currentDirection) {
          let mouseClear = window.confirm(gameMode.gameMode === 'XP' ? 'Return to normal mode from XP mode?' : 'Join to XP Mode?');
          if (mouseClear) {
            setCount(0);
            setGameMode({
              ...gameMode,
              gameMode: gameMode.gameMode === 'XP' ? '' : 'XP'
            });
          }
          else {
            setCount(0);
          }
        } else if (newDirection !== currentDirection) {
          setCount(count + 1);
        }
        setCurrentDirection(newDirection);
        setStartX(event.clientX);
      }
    }

    const timer = setTimeout(() => {
      setCount(0);
    }, 2500);

    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    }
  }, [count, startX, moveX, currentDirection]);

  const [keys, setKeys] = useState('');

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      setKeys(prevKeys => prevKeys + event.key.toLowerCase());
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  useEffect(() => {
    if (gameMode.gameMode === 'XP' &&
      keys.endsWith('soviet')) {
      let USSRMode = window.confirm('Lenin: "Do you wish to sign the Federal Treaty and join the Soviet Union?"');
      if (USSRMode) {
        console.log('-- USSR MODE! --');
        setGameMode({
          ...gameMode,
          gameMode: 'USSR'

        });
        setKeys(''); // keysをリセット
      }
      setKeys(''); // keysをリセット
    }
    if (gameMode.gameMode === '' &&
      keys.endsWith('soviet')) {
      let USSRMode = window.confirm('Lenin: "Do you wish to sign the Federal Treaty and join the Soviet Union?"');
      if (USSRMode) {
        console.log('-- USSR MODE! --');
        setGameMode({
          ...gameMode,
          gameMode: 'USSR'

        });
        setKeys(''); // keysをリセット
      }
      setKeys(''); // keysをリセット
    }
    if (gameMode.gameMode === 'USSR' &&
      keys.endsWith('collapse')) {
      let NormalMode = window.confirm('Hey! You want independence from the Soviet Union?');
      if (NormalMode) {
        console.log('-- NORMAL MODE! --');
        setGameMode({
          ...gameMode,
          gameMode: ''
        });
        setKeys(''); // keysをリセット

      }
      setKeys(''); // keysをリセット
    }
  }, [keys]);

  const getBlockStyle = (num: number): CSSProperties => {
    if (gameMode.gameMode === 'USSR') {
      switch (num) {
        case 2:
          return { background: "#071e5d url('https://purepng.com/public/uploads/large/purepng.com-vladimir-putinvladimir-putinvladimirputinvladimir-vladimirovich-putinpresident-of-russia-1701528083021cng1o.png') no-repeat", color: "#fff", backgroundSize: "95% 95%", backgroundPosition: "center center" };
        case 4:
          return { background: "#0e2f8a url('https://financialtribune.com/sites/default/files/styles/360x260/public/field/image/17january/dmitry_medvedev.png?itok=1j0EuMix') no-repeat", color: "#fff", backgroundSize: "120% 95%", backgroundPosition: "center center" };
        case 8:
          return { background: "#0B33A4 url('https://www.pngall.com/wp-content/uploads/12/Vladimir-Putin-PNG-Free-Image.png') no-repeat", color: "#fff", backgroundSize: "125% 95%", backgroundPosition: "left center" };
        case 16:
          return { background: "#1B8AE3 url('https://pbs.twimg.com/media/FYIAGUAX0AExamA.png') no-repeat", color: "#fff", backgroundSize: "82% 95%", backgroundPosition: "center center" };
        case 32:
          return { background: "#CB2217 url('https://pngimg.com/uploads/gorbachev/gorbachev_PNG22.png') no-repeat", color: "#ff0", backgroundSize: "85% 95%", backgroundPosition: "center center" };
        case 64:
          return { background: "#BC1E14 url('https://pngimg.com/uploads/brezhnev/brezhnev_PNG4.png') no-repeat", color: "#ff0", backgroundSize: "95% 95%", backgroundPosition: "center center" };
        case 128:
          return { background: "#BC1E14 url('http://media.informpskov.ru/presentation/dsk50/khruschev.png') no-repeat", color: "#ff0", backgroundSize: "95% 95%", backgroundPosition: "center center" };
        case 256:
          return { background: "#68140e url('https://pngimg.com/uploads/stalin/stalin_PNG39.png') no-repeat", color: "#ff0", backgroundSize: "95% 95%", backgroundPosition: "center center" };
        case 512:
          return { background: "#09460f url('https://pngimg.com/uploads/lenin/lenin_PNG3.png') no-repeat", color: "#fff", backgroundSize: "95% 95%", backgroundPosition: "center center" };
        case 1024:
          return { background: "#FECE39 url('https://static.wikia.nocookie.net/alanomalyrapbattles/images/4/48/Nicholas_II.png') no-repeat", color: "#000" };
        case 2048:
          return { background: "#000 url('https://freepngimg.com/save/150337-hitler-free-download-png-hd/2079x2739') no-repeat", color: "#f00", backgroundSize: "95% 95%", backgroundPosition: "-30px center", textAlign: "right" };
        case 4096:
          return { background: "#000 url('https://cdn131.picsart.com/323325096511211.png') no-repeat", color: "#f00", backgroundSize: "85% 95%", backgroundPosition: "-30px center", textAlign: "right" };
        case 8192:
          return { background: "#000 url('https://w7.pngwing.com/pngs/449/632/png-transparent-vintage-japanese-flag-flag-of-japan-rising-sun-flag-rising-sun-s-flag-text-symmetry.png') no-repeat", color: "#000", backgroundSize: "100% 100%", backgroundPosition: "center center", textAlign: "right" };
        case 16384:
          return { background: "#BC1E14 url('https://upload.wikimedia.org/wikipedia/commons/thumb/d/d9/Coat_of_arms_of_the_Soviet_Union_%281956%E2%80%931991%29.svg/1920px-Coat_of_arms_of_the_Soviet_Union_%281956%E2%80%931991%29.svg.png') no-repeat", color: "#fff", border: "1.5px solid #e2d06e", textShadow: "0px 0px 4px #000", backgroundSize: "95% 95%", backgroundPosition: "center center" };
        default:
          return {};
      }
    } else {
      switch (num) {
        case 2:
          return { backgroundColor: "#25ab69", color: "#fff" };
        case 4:
          return { backgroundColor: "#f73832", color: "#fff" };
        case 8:
          return { backgroundColor: "#70bef7", color: "#fff" };
        case 16:
          return { backgroundColor: "#ea6e1f", color: "#fff" };
        case 32:
          return { backgroundColor: "#7a1f8f", color: "#fff" };
        case 64:
          return { backgroundColor: "#a5952b", color: "#fff" };
        case 128:
          return { backgroundColor: "#252c98", color: "#fff" };
        case 256:
          return { backgroundColor: "#a01801", color: "#fff" };
        case 512:
          return { backgroundColor: "#215518", color: "#fff" };
        case 1024:
          return { background: "linear-gradient(to bottom, #f57070, #c90302)", color: "#fff", border: "1.5px solid #e2d06e" };
        case 2048:
          return { background: "linear-gradient(to bottom, #a393e2, #462ab3)", color: "#fff", border: "1.5px solid #e2d06e" };
        case 4096:
          return { background: "linear-gradient(to bottom, #8357c3, #2d0b61)", color: "#fff", border: "1.5px solid #e2d06e" };
        case 8192:
          return { background: "linear-gradient(to bottom, #a4c9f1, #2986ea)", color: "#fff", border: "1.5px solid #e2d06e" };
        case 16384:
          return { background: "#ff0000 url('https://upload.wikimedia.org/wikipedia/commons/thumb/d/d9/Coat_of_arms_of_the_Soviet_Union_%281956%E2%80%931991%29.svg/1920px-Coat_of_arms_of_the_Soviet_Union_%281956%E2%80%931991%29.svg.png') no-repeat", color: "#fff", border: "1.5px solid #e2d06e", textShadow: "0px 0px 4px #000" };
        default:
          return {};
      }
    }
  };

  let overlayStyle = Style.overlay
  let areaStyle = Style.area
  let gameTableStyle = Style.gameTable
  let startWrapStyle = Style.startWrap

  switch (gameMode.gameMode) {
    case 'XP':
      overlayStyle = Style.overlayXP
      areaStyle = Style.areaXP
      gameTableStyle = Style.gameTableXP
      startWrapStyle = Style.startWrapXP

      break
    case 'USSR':
      overlayStyle = Style.overlayUSSR
      areaStyle = Style.areaUSSR
      gameTableStyle = Style.gameTableUSSR
      startWrapStyle = Style.startWrapUSSR
      break
  }

  return (
    <>
      {!state.start &&
        <div className={Style.startWrap + ' ' + startWrapStyle}>
          {gameMode.gameMode === 'USSR' ? <div className={Style.USSRBack}>aaa</div> : ''}
          <h1><span>2048</span><br />Drop Puzzle Game</h1>
          <button className={Style.gameStart} onClick={() => {
            start(fallBlockDispatch, state)
          }}>Game Start!</button>
          <p>
            {gameMode.gameMode === 'USSR' ? 'Ти записався добровольцем?' : '同じ数字のブロックを繋げてハイスコアを目指そう！'}
          </p>
        </div>
      }
      {state.gameover && <div className={Style.overlay + ' ' + overlayStyle}>
        <button className={Style.restart} onClick={() => {
          restart(fallBlockDispatch, fieldDispatch, state)
        }}>リスタート</button>
      </div>}

      {state.pause && <div className={Style.pauseOverlay} onClick={() => {
        pause(fallBlockDispatch, state)
      }}>
        <h1>PAUSE</h1></div>}
      <div className={Style.area + ' ' + areaStyle}>
        <ul className={Style.circles}>
          <li></li>
          <li></li>
          <li></li>
          <li></li>
          <li></li>
          <li></li>
          <li></li>
          <li></li>
          <li></li>
          <li></li>
        </ul>
        <table className={Style.gameTable + ' ' + gameTableStyle}>
          <caption><span>Prev Score : {state.preScore}</span><span>Score : {state.score}</span><span style={getBlockStyle(num[state.nextNum])} className={Style.next}>{num[state.nextNum]}</span>
            <button className={Style.resetButton} onClick={() => {
              restart(fallBlockDispatch, fieldDispatch, state)
            }}></button>
            <button className={Style.pauseButton} onClick={() => {
              pause(fallBlockDispatch, state)
            }}></button></caption>
          <tbody>
            {fieldState.map((y, yIndex) =>
              <tr key={yIndex} className={Style.tr}>
                {y.map((x, xIndex) => {
                  if (state.x === xIndex && state.y === yIndex) {
                    return <td key={xIndex} className={Style.td} style={getBlockStyle(num[state.num])}>{num[state.num].toString()}</td>
                  }
                  else {
                    return <td key={xIndex} className={Style.td} style={getBlockStyle(x)}>{x === 0 ? null : x.toString()}</td>
                  }
                })}
              </tr>
            )}
          </tbody>
        </table>
        <button className={Style.home} onClick={() => {
          start(fallBlockDispatch, state)
        }
        }></button>
        <button style={{ 'left': state.start ? '100px' : '20px', 'zIndex': !state.gameover ? '100' : '1' }} className={Style.hint} onClick={() => {
          setHintState({
            ...hintState,
            isShowHint: true
          })
          pause(fallBlockDispatch, state)
        }}></button>
        {hintState.isShowHint && <><div className={Style.hintWrap} onClick={() => {
          setHintState({
            ...hintState,
            isShowHint: false
          })
          pause(fallBlockDispatch, state)
        }}></div>
          <div className={Style.hintText}>
            <h1>2048ドロップパズルゲーム</h1>
            <p>パズルをつなげてより大きな数字をたくさんつくろう。</p>
            <ul>
              <li>イースターエッグについて
                <ul>
                  <li>左右に500px以上マウスを振ると、XP Modeと通常モードを切り替えることができます。</li>
                  <li>また、キーボードで「soviet」をキー押下すると、USSR Modeに入ることができます。</li>
                  <li>USSR Modeの際に「collapse」をキー押下すると、通常モードに戻ることができます。</li>
                </ul>

              </li>
            </ul>
            <p><a href="https://game.hiroba.dpoint.docomo.ne.jp/lightgame/game/448">参考 : 2048ゲーム</a></p>
          </div></>}
      </div>
    </>
  )
}

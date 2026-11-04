# 크랙 GPT 브리지 0.2.11.1

크랙의 **GPT 브리지 연결** 확장 프로그램이 같은 기기에서 본인의 ChatGPT 구독으로 작업을 요청할 수 있게 한다. 브리지는 `127.0.0.1`에서 실행된다. Node.js 22 이상이 필요하다.

## Android · Termux 설치

```bash
pkg install git nodejs-lts
git clone https://github.com/jerry76478/crack-gpt-bridge.git
cd crack-gpt-bridge/termux-bridge
bash install-termux.sh
```

설치 프로그램이 브리지를 시작한다. Termux를 켜 둔 채 터미널에 표시된 관리 주소를 **같은 기기**의 브라우저에서 연다. **Continue with ChatGPT**로 로그인하고 **확장 프로그램용 연결 주소 복사**를 누른다. 크랙에서 **GPT 브리지 연결 → 주소 넣기**에 붙여 넣는다. 연결 주소의 `pair`는 비밀번호처럼 보관한다.

## 원작에서 옮겨 오기

원작 브리지를 설치한 폰에서는 기존 서버를 Ctrl+C로 끈다. 위의 우리 저장소를 받은 뒤 그 안의 `termux-bridge`에서 다음을 실행한다.

```bash
bash update-termux.sh
bash ~/local-gpt-subscription-bridge/start.sh
```

기존 설치 자리의 프로그램 파일을 갱신하고 다음 Git 업데이트 원본을 이 저장소로 바꾼다. 계정·pair·작업 기록은 기존 `~/.local-gpt-subscription-bridge`에서 이어진다.

## ZIP 설치

[배포 ZIP 폴더](https://github.com/jerry76478/crack-gpt-bridge/tree/main/releases)에서 최신 판을 받아 압축을 푼다. Android에서는 Node.js 22 이상을 설치하고 압축 안의 `crack-gpt-bridge/termux-bridge`에서 `bash install-termux.sh`를 실행한다.

## Windows

Git과 Node.js 22 이상을 설치한다. PowerShell에서 다음을 실행한다. ZIP으로 받았다면 압축을 푼 `termux-bridge` 폴더에서 마지막 명령을 실행한다.

```powershell
git clone https://github.com/jerry76478/crack-gpt-bridge.git
cd crack-gpt-bridge/termux-bridge
powershell -ExecutionPolicy Bypass -File .\start-windows.ps1
```

관리 주소로 로그인한 뒤 확장 프로그램용 연결 주소를 같은 PC의 크랙에 붙여 넣는다. 브리지를 쓰는 동안 실행 창을 열어 둔다.

## 재부팅과 업데이트

폰을 재부팅하면 Termux에서 `bash ~/local-gpt-subscription-bridge/start.sh`를 실행한다. 자동으로 켜려면 Termux와 같은 배포처에서 Termux:Boot를 설치하고 앱을 한 번 연다. `~/.termux/boot/`에 다음 내용의 실행 가능한 파일을 둔다.

```bash
#!/data/data/com.termux/files/usr/bin/bash
termux-wake-lock
bash ~/local-gpt-subscription-bridge/start.sh >/dev/null 2>&1 &
```

Windows에서는 다시 `start-windows.ps1`을 실행한다. 관리 화면에서 업데이트를 확인한 뒤 적용하면 Git 설치본은 이 저장소의 main에서, ZIP 설치본은 releases 폴더에서 새 판을 받는다. 최초 설치 때 사용한 Git 사본은 보관한다.

원작은 eun033/RpCleanerEpub의 GPT 브리지 0.2.11이며 MIT 라이선스로 배포됐다. 이전 판 기록은 원작 README에서 볼 수 있다. [원작 및 판 기록](https://github.com/eun033/RpCleanerEpub/tree/main/main/wish-core-hap-gpt/termux-bridge) · [라이선스](./LICENSE)

import * as React from "react";
import * as ReactDOM from "react-dom";
import axios from "axios";
import { useScreenshot } from "use-screenshot-hook";
// import regeneratorRuntime from "regenerator-runtime";
import "./worklog.css";
import { Detector } from "react-detect-offline";

const WorkLog = () => {
  const video = React.useRef(null);
  var canvas = React.useRef(null);
  var takeScreenShot = React.useRef(null);
  const ref = React.useRef(null);
  const imageRef = React.useRef(null);
  const countRef = React.useRef(null);
  const [Employers, setEmployers] = React.useState(null);
  const [timer, setTimer] = React.useState(0);
  const [images, setImages] = React.useState([]);
  const [latesttime, setLatestTime] = React.useState(0);
  const [isActive, setIsActive] = React.useState(false);
  const [isPaused, setIsPaused] = React.useState(false);
  const [timerStart, setTimerStart] = React.useState(false);
  const [weaklyTrackedTImes, setWeaklyTrackedTImes] = React.useState(0);
  const [errormessage, seterrormessage] = React.useState(
    "Please enter the valid credentials"
  );
  const [userDatas, setUserDatas] = React.useState({
    user_email: null,
    password: null,
    tracker_installed: true,
  });
  const [loading, setLoading] = React.useState(false);
  const [userValidation, setUserValidation] = React.useState({
    user_email: false,
    password: false,
  });
  const [todayTrackedTImes, setTodayTrackedTImes] = React.useState(0);
  const [loginValdations, setLoginValidations] = React.useState(false);

  const [project, setProject] = React.useState("select");
  const [offline, setOffLine] = React.useState(true);

  React.useEffect(() => {
    setLoginValidations(
      JSON.parse(window.localStorage.getItem("userData")) &&
        JSON.parse(window.localStorage.getItem("userData")).user_id
        ? true
        : false
    );
  }, [JSON.parse(window.localStorage.getItem("userData"))]);

  const employerList = async (token=null) => {
    const config = {
      method: "POST",
      url: `https://jobseekerapi.virtualstaff.ph/api/v1/job-seeker/hired-employer/list`,
      data: {
        employer_id:
          JSON.parse(window.localStorage.getItem("userData")) &&
          JSON.parse(window.localStorage.getItem("userData")).user_id,
        skip: 0,
        limit: 0,
      },
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "Access-Control-Allow-Origin": "*",
        Authorization: window.localStorage.getItem("token") || token,
      },
    };
    axios(config)
      .then((a) => {
        // console.log("a..........",a.data.result.data.data)
        if (a.data) {
          setEmployers(a.data.result.data.data);
          // setLoginValidations(true);
        }
      })
      .catch((err) => {
        // setLoginValidations(false);
      });
  };

  React.useEffect(() => {
    window.localStorage.removeItem("Project");
    employerList();
  }, []);

  const { image, takeScreenshot, isLoading, clear } = useScreenshot({
    ref: imageRef,
  });

  const handleChange = (event) => {
    setEmployers(event.target.value);
  };

  var constraints = {
    audio: false,
    video: {
      mandatory: {
        chromeMediaSource: "desktop",
        minWidth: 1280,
        maxWidth: 1280,
        minHeight: 720,
        maxHeight: 720,
      },
    },
  };
  function dumpOptionsInfo() {
    const videoTrack = video.current.srcObject.getVideoTracks()[0];
  }

  const handlePause = async () => {};

  // useEffect(async ()=>{
  //   if(new Date().getHours() === 23 && new Date().getMinutes() === 59 && new Date().getSeconds() === 59){
  //     await pauseCapture()
  //   }
  // },[timer])

  const handleStart = async () => {
    window.localStorage.setItem("startDate", new Date());
    setIsActive(true);
    setTimerStart(true);
    if (parseInt(latesttime) > 0) {
      let savedTime = await parseInt(latesttime);
      await setTimer(savedTime + 1);
      countRef.current = setInterval(() => {
        setTimer((timer) => timer + 1);
        setTodayTrackedTImes((times) => times + 1);
      }, 1000);
    } else if (parseInt(latesttime) > 0 && parseInt(latesttime) < timer) {
      countRef.current = setInterval(() => {
        setTimer((timer) => timer + 1);
        setTodayTrackedTImes((times) => times + 1);
      }, 1000);
    } else {
      countRef.current = setInterval(() => {
        setTimer((timer) => timer + 1);
        setTodayTrackedTImes((times) => times + 1);
      }, 1000);
    }
  };

  const startCapture = async () => {
    try {
      video.current.srcObject = await navigator.mediaDevices.getUserMedia(
        constraints
      );
      dumpOptionsInfo();
      takeScreenShot.current = setInterval(async () => {
        var context = canvas.current.getContext("2d");
        ratio = video.current.videoWidth / video.current.videoHeight;
        w = video.current.videoWidth - 100;
        h = parseInt(w / ratio, 10);
        canvas.current.width = w;
        canvas.current.height = h;
        var w, h, ratio;
        context.fillRect(0, 0, w, h);
        context.drawImage(video.current, 0, 0, w, h);
        var datas = {
          image: canvas.current.toDataURL(),
          created_At: new Date(),
          savedDate: Date.now(),
          payment_id: window.localStorage.getItem("Project"),
          created_Date: new Date().toDateString(),
        };
        saveEmployeeImages(datas);
      }, 360000);
      handleStart();
    } catch (err) {}
  };
  function stopCapture(evt) {
    if (images.length > 0) {
      let tracks = video.current.srcObject.getTracks();

      tracks.forEach((track) => track.stop());
      video.current.srcObject = null;
      handlePause();
    }
  }

  const formatedTime = (time) => {
    const getSeconds = `0${time % 60}`.slice(-2);
    const minutes = `${Math.floor(time / 60)}`;
    const getMinutes = `0${minutes % 60}`.slice(-2);
    const getHours = `0${Math.floor(time / 3600)}`.slice(-2);
    return `${getHours} hr : ${getMinutes} mins : ${getSeconds} sec`;
  };

  const SaveTimer = async (e) => {
    const config = {
      method: "POST",
      url: `https://timetracker.virtualstaff.ph/api/v1/tracker/savetimer`,
      data: e,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "Access-Control-Allow-Origin": "*",
        Authorization: window.localStorage.getItem("token"),
      },
    };
    axios(config)
      .then(async (a) => {
        clearInterval(takeScreenShot.current);
        clearInterval(countRef.current);
        setLatestTime(timer);
        // if(new Date().getHours() === 1){
        //   await startCapture()
        // }
      })
      .catch((err) => {});
  };
  async function pauseCapture() {
    setIsActive(false);

    setTimerStart(false);
    clearInterval(takeScreenShot.current);
    clearInterval(countRef.current);

    if (
      timer - (latesttime ? latesttime : 0) > 60 &&
      window.localStorage.getItem("Project")
    ) {
      var datas = {
        startTime: latesttime,
        endTime: timer,
        endDate: new Date(),
        startDate: new Date(window.localStorage.getItem("startDate")),
        payment_id: window.localStorage.getItem("Project"),
        created_At: new Date(),
        created_Date: new Date().toDateString(),
        totalTimes: timer - (latesttime ? latesttime : 0),
        time_type: "automatic",
      };
      await SaveTimer(datas);
      clearInterval(takeScreenShot.current);
      clearInterval(countRef.current);
      setLatestTime(timer);
      window.localStorage.removeItem("Project");
      setProject("select");
      setTimer(0);
      setTodayTrackedTImes(0);
    } else {
      clearInterval(takeScreenShot.current);
      clearInterval(countRef.current);
      setTimer(0);
      window.localStorage.removeItem("Project");
      setProject("select");
    }
  }

  const saveEmployeeImages = (imageData) => {
    const config = {
      method: "POST",
      url: `https://timetracker.virtualstaff.ph/api/v1/tracker/saveimages`,
      data: imageData,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "Access-Control-Allow-Origin": "*",
        Authorization: window.localStorage.getItem("token"),
      },
    };
    axios(config)
      .then(async (a) => {
        let employerDatass = Employers;
        let SampleEmp = a.data
          ? employerDatass.concat(a.data.result.data)
          : Employers;
        setEmployers(SampleEmp);
      })
      .catch((err) => {});
  };

  React.useEffect(() => {
    if (isActive && image) {
      var datas = {
        image: image,
        created_At: new Date(),
        savedDate: Date.now(),
        payment_id: "61c431a91d599f55bc372750",
        created_Date: new Date().toDateString(),
      };

      saveEmployeeImages(datas);
    }
  }, [image]);

  const UserLogin = () => {
    setLoading(true);
    const config = {
      method: "POST",
      url: `https://authapi.virtualstaff.ph/api/v1/auth/trackerlogin`,
      data: userDatas,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    };
    axios(config)
      .then(async (a) => {
        setUserDatas({
          user_email: null,
          password: null,
        });
        setLoading(false);
        window.localStorage.setItem("token", a.data.result.access_token);
        window.localStorage.setItem("userData", JSON.stringify(a.data.result));
        setLoginValidations(true);
        let sampleUserValidation = Object.assign({}, userValidation, {
          password: false,
        });
        setUserValidation(sampleUserValidation);
        // setUserValidation({ ...userValidation, password: false });
        employerList(a.data.result.access_token);
      })
      .catch((err) => {
        setUserDatas({
          user_email: "",
          password: null,
        });
        setLoading(false);

        setLoginValidations(false);
        let userValidationData = Object.assign({}, userValidation, {
          password: true,
        });
        setUserValidation(userValidationData);
        // setUserValidation({ ...userValidation, password: true });
      });
  };
  const userCredentials = (e) => {
    e.preventDefault();
    let name = e.target.name;
    if (name == "user_email") {
      var regx = /^[a-zA-Z0-9+_.-]+@[a-zA-Z.-]+\.[a-zA-Z]+$/;

      // "^[a-zA-Z0-9+_.-]+@[a-zA-Z0-9.-]+$"
      let data = regx.test(e.target.value);
      let sampleUserData = Object.assign({}, userDatas, {
        user_email: data ? e.target.value : e.target.value,
      });
      setUserDatas(sampleUserData);
      // setUserDatas({
      //   ...userDatas,
      //   "user_email": data ? e.target.value : e.target.value,
      // });
      let smpleUserValidation = Object.assign({}, userValidation, {
        user_email: data ? false : true,
      });
      setUserValidation(smpleUserValidation);
      // setUserValidation({ ...userValidation, user_email: data ? false : true });
    } else {
      let sampleUserData = Object.assign({}, userDatas, {
        [name]: e.target.value,
      });
      setUserDatas(sampleUserData);
      // setUserDatas({ ...userDatas, [name]: e.target.value });
    }
  };

  const selectHandleChange = (e) => {
    if (e.target.value !== "select") {
      window.localStorage.setItem("Project", e.target.value);
      setProject(e.target.value);
      const config = {
        method: "POST",
        url: `https://timetracker.virtualstaff.ph/api/v1/tracker/weakly-time-tracked`,
        data: {
          payment_id: e.target.value,
        },
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          "Access-Control-Allow-Origin": "*",
          Authorization: window.localStorage.getItem("token"),
        },
      };
      axios(config)
        .then(async (a) => {
          setTimer(parseInt(a.data.result));
          setLatestTime(parseInt(a.data.result));
        })
        .catch((err) => {});

      const configs = {
        method: "POST",
        url: `https://timetracker.virtualstaff.ph/api/v1/tracker/today-time-tracked`,
        data: {
          payment_id: e.target.value,
        },
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          "Access-Control-Allow-Origin": "*",
          Authorization: window.localStorage.getItem("token"),
        },
      };
      axios(configs)
        .then(async (a) => {
          setTodayTrackedTImes(parseInt(a.data.result));
        })
        .catch((err) => {});
    }
  };

  const logout = () => {
    window.localStorage.removeItem("userData");
    window.localStorage.removeItem("token");
    window.localStorage.removeItem("Project");
    setLoginValidations(false);
  };
  const onLineStatus = async () => {
    if (window.localStorage.getItem("offlineTImer") && !offline) {
      let datasss = await window.localStorage.getItem("offlineTImer");
      window.localStorage.removeItem("offlineTImer");
      await setLatestTime(parseInt(JSON.parse(datasss).endTime));
      await setTimer(parseInt(JSON.parse(datasss).endTime));
      await SaveTimer(JSON.parse(datasss));
      setOffLine(true);
    }
  };

  const apiStatus = () => {
    if (
      window.localStorage.getItem("offlineTImer") == null &&
      latesttime !== timer
    ) {
      var datas = {
        startTime: latesttime,
        endTime: timer,
        endDate: new Date(),
        startDate: new Date(window.localStorage.getItem("startDate")),
        payment_id: window.localStorage.getItem("Project"),
        created_At: new Date(),
        created_Date: new Date().toDateString(),
        totalTimes: timer - (latesttime ? latesttime : 0),
        time_type: "automatic",
      };
      setTimeout(() => {
        window.localStorage.setItem("offlineTImer", JSON.stringify(datas));
      }, 3000);
      setIsActive(false);
      setTimerStart(false);
      clearInterval(takeScreenShot.current);
      clearInterval(countRef.current);
      setOffLine(false);
      window.localStorage.removeItem("Project");
      setTimer(0);
      setTodayTrackedTImes(0);
      setProject("select");
    }
  };

  // console.log("before return", userValidation, userDatas);
  return (
    <div className="app">
      {/* {console.log("after return", userValidation, userDatas)} */}
      {JSON.parse(window.localStorage.getItem("userData")) &&
      JSON.parse(window.localStorage.getItem("userData")).full_name ? (
        <div
          onClick={logout}
          style={{
            display: "flex",
            justifyContent: "flex-end",
            marginBottom: "20px",
          }}
        >
          <div className="logoutIcon">
            <i class="fas fa-sign-out-alt" style={{ fontSize: "25px" }}></i>
          </div>
          <br />
        </div>
      ) : (
        " "
      )}
      <div className="title">
        <img
          className="imgWork"
          src={
            "data:image/png;base64,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"
          }
        />
        <p className="worklog">Work Log </p>
      </div>
      {loginValdations  ? (
        <div>
          <p className="loggedIn">
            Logged in as a{" "}
            {JSON.parse(window.localStorage.getItem("userData")) &&
              JSON.parse(window.localStorage.getItem("userData")).full_name}
          </p>
          <p className="ProjectTitle">Employer</p>

          <select
            value={project}
            name="project"
            id="project_id"
            onChange={selectHandleChange}
          >
            <option value="select" className="options">
              Select employer
            </option>
            {/* {console.log("Employers",Employers)} */}
            {Employers && Employers.length &&
              Employers.map((e) =>
                e.employement_status == "working" ? (
                  e.hired_job_id &&  e.job_id &&
                  <option key={e.hired_job_id._id} value={e.hired_job_id._id}>
                    {e.job_id.job_title} - {e.employer_id.user_email}
                  </option>
                ) : (
                  " "
                )
              )}
          </select>
          <br />
          <p className="timer">Today Logged time</p>
          <p className="timer">{formatedTime(todayTrackedTImes)}</p>
          <br />
          <p className="timer">Weekly Logged time</p>
          <p className="timer">{formatedTime(timer)}</p>
          <br />
          <div className="button_group">
            <button
              style={{
                pointerEvents:
                  window.localStorage.getItem("Project") && !isActive
                    ? "auto"
                    : "none",
                backgroundColor:
                  window.localStorage.getItem("Project") && !isActive
                    ? "#004c70"
                    : "#e5e5e5",
                color:
                  window.localStorage.getItem("Project") && !isActive
                    ? "#ffffff"
                    : "#33444d",
              }}
              id="btn_start"
              onClick={startCapture}
            >
              Start timer
            </button>
            <button
              style={{
                pointerEvents: isActive ? "auto" : "none",
                backgroundColor: isActive ? "#004c70" : "#e5e5e5",
                color: isActive ? "#ffffff" : "#33444d",
              }}
              id="btn_stop"
              onClick={pauseCapture}
            >
              Stop timer
            </button>
          </div>
          <video
            ref={video}
            controls="controls"
            width="800"
            height="680"
            autoPlay={true}
            style={{ display: "none" }}
          ></video>
          <div ref={imageRef} style={{ display: "none" }}>
            <canvas
              ref={canvas}
              style={{ display: "none" }}
              id="canvas"
              width="640"
              height="480"
            ></canvas>
          </div>
          <div style={{ display: "none" }}>
            {images && images.map((e) => <img src={e} height="300px" />)}
          </div>
        </div>
      ) : (
        <div>
          <p className="loginString">Login to Start the work log</p>
          <input
            type="email"
            name="user_email"
            placeholder="Enter your email address"
            onChange={(e) => userCredentials(e)}
            value={userDatas.user_email}
            required
          />
          {userValidation.user_email ? (
            <p style={{ color: "red", fontSize: "13px", margin: "0px" }}>
              Please Enter the valid email
            </p>
          ) : (
            <p style={{ color: "red", fontSize: "13px", margin: "0px" }}>
              &nbsp;
            </p>
          )}
          <input
            type="password"
            name="password"
            placeholder="Enter your password"
            onChange={userCredentials}
            value={userDatas.password == null ? "" : userDatas.password}
          />
          <br />
          <button
            id="submit"
            value="Submit"
            style={{
              pointerEvents:
                userDatas.password &&
                userDatas.user_email &&
                !loading &&
                !userValidation.user_email
                  ? "auto"
                  : "none",
              backgroundColor:
                userDatas.password &&
                userDatas.user_email &&
                !loading &&
                !userValidation.user_email
                  ? "#004c70"
                  : "#e5e5e5",
              color:
                userDatas.password &&
                userDatas.user_email &&
                !loading &&
                !userValidation.user_email
                  ? "#ffffff"
                  : "#33444d",
            }}
            type="submit"
            onClick={UserLogin}
          >
            {loading ? "Loading....." : "Sign in"}
          </button>
          {userValidation.password ? (
            <p
              style={{
                color: "red",
                fontSize: "13px",
                margin: "0px",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              {errormessage}
            </p>
          ) : (
            ""
          )}
        </div>
      )}
      <Detector
        style={{ display: "none" }}
        render={({ online }) => (
          <div
            className={online ? "normal" : "warning"}
            onClick={online ? onLineStatus() : apiStatus()}
          ></div>
        )}
      />
    </div>
  );
};

export default WorkLog;

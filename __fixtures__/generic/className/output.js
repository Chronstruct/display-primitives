<>
  <div className={`generic ${`b__e--m`} `} />

  <div className={`generic someString `} />

  <div className={`generic someString `} />

  <div className={`generic ${someVar} `} />

  <div className={`generic ${`${someVar}`} `} />

  <div className={`generic ${cx("someString", someBool && "someOtherString")} `} />
</>;
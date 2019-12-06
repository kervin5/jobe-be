const MILISECONDS_INTERVAL = 10 * 60 * 1000;
// const MILISECONDS_INTERVAL = 15000;

const scheduleFunction = ({ jobId, cronTaksId, timeObject, db }) => {
  let futureDate = new Date(timeObject.getTime() + MILISECONDS_INTERVAL);
  let lastDate = new Date(timeObject.getTime());
  return () => {
    const updateInterval = setInterval(async () => {
      lastDate = futureDate;
      futureDate = new Date(lastDate.getTime() + MILISECONDS_INTERVAL);

      const jobData = await db.query.job(
        {
          where: { id: jobId }
        },
        "{title status cronTask { id } }"
      );

      if (jobData.cronTask && jobData.cronTask.id !== cronTaksId) {
        console.log("orphan");
        clearInterval(updateInterval);
        return null;
      }

      if (jobData.cronTask && jobData.status !== "DELETED") {
        if (jobData.status === "POSTED") {
          await db.mutation.updateJobCronTask(
            {
              where: { id: cronTaksId },
              data: {
                lastRun: lastDate,
                nextRun: futureDate,
                result: "Success"
              }
            },
            `{ id }`
          );

          await db.mutation.updateJob({
            where: { id: jobId },
            data: { title: jobData.title }
          });

          console.log(jobId, new Date());
        } else {
          console.log("failed");
        }
      } else {
        console.log("cleared");
        clearInterval(updateInterval);
        await unscheduleJobAutoUpdate({ db }, jobId);
      }
    }, MILISECONDS_INTERVAL);
  };
};

async function scheduleJobAutoUpdate(ctx, jobId) {
  try {
    var timeObject = new Date();

    const jobCronTask = await ctx.db.mutation.createJobCronTask(
      {
        data: {
          job: { connect: { id: jobId } },
          lastRun: timeObject,
          nextRun: new Date(timeObject.getTime() + MILISECONDS_INTERVAL),
          result: "Created",
          objectId: jobId
        }
      },
      `{ id }`
    );

    await ctx.db.mutation.updateJob(
      {
        where: { id: jobId },
        data: { cronTask: { connect: { id: jobCronTask.id } } }
      },
      "{title status cronTask { id } }"
    );

    scheduleFunction({
      jobId: jobId,
      cronTaksId: jobCronTask.id,
      timeObject,
      db: ctx.db
    })();

    return jobCronTask.id;
  } catch (err) {
    return null;
  }
}

async function unscheduleJobAutoUpdate(ctx, jobId) {
  try {
    if (await ctx.db.exists.JobCronTask({ objectId: jobId })) {
      await ctx.db.mutation.deleteJobCronTask(
        { where: { objectId: jobId } },
        `{ id }`
      );
    }

    await ctx.db.mutation.updateJob({
      where: { id: jobId },
      data: { cronTask: null }
    });

    return jobId;
  } catch (err) {
    return null;
  }
}

async function restartJobAutoUpdate(db) {
  try {
    const jobCronTasks = await db.query.jobCronTasks({}, `{ id objectId}`);

    jobCronTasks.forEach((jobCronTask, index) => {
      setTimeout(() => {
        const timeObject = new Date();
        scheduleFunction({
          jobId: jobCronTask.objectId,
          cronTaksId: jobCronTask.id,
          timeObject,
          db
        })();
      }, index * 120000 + Math.round(Math.random() * 60000));
    });

    return jobCronTasks;
  } catch (err) {
    console.log(err);
    return null;
  }
}

module.exports = {
  scheduleJobAutoUpdate,
  unscheduleJobAutoUpdate,
  restartJobAutoUpdate
};

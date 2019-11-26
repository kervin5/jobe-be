async function scheduleJobAutoUpdate(ctx, jobId) {
  try {
    var timeObject = new Date();

    const jobCronTask = await ctx.db.mutation.createJobCronTask(
      {
        data: {
          job: { connect: { id: jobId } },
          lastRun: timeObject,
          nextRun: new Date(timeObject.getTime() + 10000),
          result: "Created",
          objectId: jobId
        }
      },
      `{ id }`
    );

    const scheduleJob = (({ jobId, cronTaksId }) => {
      let futureDate = new Date(timeObject.getTime() + 10000);
      let lastDate = new Date(timeObject.getTime());
      return () => {
        const updateInterval = setInterval(async () => {
          lastDate = futureDate;
          futureDate = new Date(lastDate.getTime() + 10000);

          const jobData = await ctx.db.mutation.updateJob(
            {
              where: { id: jobId },
              data: { cronTask: { connect: { id: cronTaksId } } }
            },
            "{title cronTask { id } }"
          );

          if (jobData.cronTask) {
            await ctx.db.mutation.updateJobCronTask(
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

            await ctx.db.mutation.updateJob({
              where: { id: jobId },
              data: { title: jobData.title }
            });
          } else {
            console.log("Clear task");
            clearInterval(updateInterval);
          }
        }, 5000);
      };
    })({ jobId, cronTaksId: jobCronTask.id });

    scheduleJob();

    return jobCronTask.id;
  } catch (err) {
    return null;
  }
}

async function unscheduleJobAutoUpdate(ctx, jobId) {
  try {
    const jobCronTask = await ctx.db.mutation.deleteJobCronTask(
      { where: { objectId: jobId } },
      `{ id }`
    );

    await ctx.db.mutation.updateJob({
      where: { id: jobId },
      data: { cronTask: null }
    });

    return jobId;
  } catch (err) {
    return null;
  }
}

async function restartJobAutoUpdate(ctx) {
  try {
    const jobCronTask = await ctx.db.mutation.deleteJobCronTask(
      { where: { objectId: jobId } },
      `{ id }`
    );

    await ctx.db.mutation.updateJob({
      where: { id: jobId },
      data: { cronTask: null }
    });

    return jobId;
  } catch (err) {
    return null;
  }
}

module.exports = { scheduleJobAutoUpdate, unscheduleJobAutoUpdate };

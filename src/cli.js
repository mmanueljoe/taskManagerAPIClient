import {createInterface} from 'node:readline/promises';
import {stdin as input, stdout as output} from 'node:process';

function header(title){
    console.clear();
    console.log(`\n=== ${title} ===\n`);
}

function menu() {
    console.log(`
        [1] List ALL tasks
        [2] List tasks by USER
        [3] Show STATS
        [4] Filter tasks (Completed)
        [5] Filter tasks (Pending)
        [6] Search tasks by keyword
        [7] Show leaderboard (by completion %)
        [8] Toggle a task's completion
        [9] Show unique "tags"
        [q] Quit
    `);
}

function printTasks(tasks, limit = 50){
    if(tasks.length === 0){
        console.log('No tasks found.\n');
        return;
    }

    for (const task of tasks.slice(0, limit)){
        console.log(task.toLine());
    }
    
    if(tasks.length > limit){
        console.log(`\n... and ${tasks.length - limit} more`);
    }
    console.log('');
}

function printStatistics(stats){
    console.log(`Total: ${stats.totalTasks}`);
    console.log(`Completed: ${stats.completedTasks}`);
    console.log(`Pending: ${stats.pendingTasks}`);
    console.log(`Overdue: ${stats.overdueTasks}`);
    console.log(`Unique users: ${stats.uniqueUsers}\n`);
}

function printLeaderboard(rows){
    if(rows.length === 0) return console.log('No users.\n');

    for (const row of rows){
        console.log(`#${row.id} ${row.name} (@${row.username}) - ${row.rate}%`);
    }

    console.log('');
}

function printTags(set){
    if(!(set instanceof Set) || set.size === 0){
        console.log('No tags detected.\n');
        return;
    }

    console.log([...set].sort().join(','));
}



export async function runCLI(manager){
    const readLine = createInterface({input, output});

    try{
        let running  = true;
        while(running){
            header('Task Manager CLI');
            menu();
            const choice = (await readLine.question('Select an option:')).trim().toLowerCase();

            switch(choice){
                case '1': {
                    header('All Tasks');
                    printTasks(manager.allTasks());
                    await readLine.question('Press Enter to return to menu...');
                    break;
                }
                case '2': {
                    header('Tasks by User');
                    const userId = await readLine.question('Enter userId (1-10):');

                    console.log(`\nUser: ${manager.getUserLabel(userId)}\n`);
                    printTasks(manager.tasksByUser(userId));
                    await readLine.question('Press Enter to return to menu...');
                    break
                }
                case '3': {
                    header('Statistics');
                    printStatistics(manager.statistics());
                    await readLine.question('Press Enter to return to menu...');
                    break;
                }
                case '4': {
                    header('Completed Tasks');
                    printTasks(manager.completedTasks());
                    await readLine.question('Press Enter to return menu...');
                    break;
                }
                case '5': {
                    header('Pending Tasks');
                    printTasks(manager.pendingTasks());
                    await readLine.question('Press Enter to return menu...');
                    break;
                }
                case '6': {
                    header('Search Tasks');
                    const query = await readLine.question('Enter keyword(s) separated by spaces:');
                    const keywords = query.split(/\s+/).filter(Boolean);
                    const results = manager.search(...keywords);
                    console.log(`\nFound ${results.length} result(s) for: ${keywords.join(',')}\n`);
                    printTasks(results);
                    await readLine.question('Press Enter to return to menu...');
                    break;
                }
                case '7': {
                    header('Leaderboard (Completion %)');
                    printLeaderboard(manager.usersLeaderboard());
                    await readLine.question('Press Enter to return to menu...');
                    break;
                }
                case '8': {
                    header('Toogle Task');
                    const id = await readLine.question('Enter taskId to toggle:');

                    try{
                        const task = manager.toggleTask(id);
                        console.log(`Toggled: ${task.toLine()}\n`);
                    } catch(err){
                        console.error(`Error: ${err.message}\n`);
                    }

                    await readLine.question('Press Enter to return to menu...');
                    break;
                }
                case '9': {
                    header('Unique Tags');
                    printTags(manager.tags());
                    await readLine.question('Press Enter to return to menu...');
                    break;
                }
                case 'q':
                case 'quit':
                case 'exit': {
                    running = false;
                    break;
                }
                default: {
                    console.log('\nInvalid option. Try again.\n');
                    await new Promise(response => setTimeout(response, 800));
                }
            }
        }
    }catch(err){
        console.log('\nCLI Error: ', err.message);
    }finally{
        readLine.close();
        console.log('\nGoodbye');
    }
}
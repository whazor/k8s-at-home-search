import sqlite3
import os

base_path = os.environ['DEVENV_ROOT']

if not base_path:
    print("DEVENV_ROOT not set")
    exit(1)

old = os.environ.get("DATE")
if not old:
    print("DATE not set")
    exit(1)


# in memory
conn = sqlite3.connect(':memory:')
cur = conn.cursor()
cur.execute("ATTACH DATABASE ? AS repos", (os.path.join(base_path, "web", "repos.db"),))
cur.execute("ATTACH DATABASE ? AS oldRepos", (os.path.join(base_path, "web", "repos-" + old + ".db"),))

def get_count(cur, db):
    cur.execute(
        "select release_name, count(*) "
        "from "+db+".flux_helm_release " 
        "group by release_name "
        "order by count(*) desc "
    )
    # convert to map
    repos = dict(cur.fetchall())
    return repos

current = get_count(cur, "repos")
old = get_count(cur, "oldRepos")

# calculate diff
diff = {}
for repo in current:
    if repo in old:
        diff[repo] = current[repo] - old[repo]

how_many = 15
top = sorted(diff.items(), key=lambda x: x[1], reverse=True)[:how_many]
bottom = sorted(diff.items(), key=lambda x: x[1])[:how_many]

first_column = len('month ago')
second_column = len('current')
third_column = len('release name')
extra = max(third_column, max(len(v[0]) for v in top))

print("Top " + str(len(top)) + " added")
print("```")
print(f"┌───────────┬─────────┬{'─'*(extra+2)}┐")
print(f"| month ago | current | {'release name':<{extra}} |")
print(f"├───────────┼─────────┼{'─'*(extra+2)}┤")
for (k, v) in top:
    month_ago, cur = old[k], current[k]
    print(f"| {month_ago:<{first_column}} | {cur:<{second_column}} | {k:<{extra}} |")

print(f"└───────────┴─────────┴{'─'*(extra+2)}┘")
print("```")

print("")
print("Most " + str(len(bottom)) + " deleted")
extra = max(third_column, max(len(v[0]) for v in bottom))
print("```")
print(f"┌───────────┬─────────┬{'─'*(extra+2)}┐")
print(f"| month ago | current | {'release name':<{extra}} |")
print(f"├───────────┼─────────┼{'─'*(extra+2)}┤")
for (k, v) in bottom:
    month_ago, cur = old[k], current[k]
    print(f"| {month_ago:<{first_column}} | {cur:<{second_column}} | {k:<{extra}} |")
print(f"└───────────┴─────────┴{'─'*(extra+2)}┘")
print("```")
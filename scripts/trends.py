import sqlite3
import os

base_path = os.environ['DEVENV_ROOT']

if not base_path:
    print("DEVENV_ROOT not set")
    exit(1)

old_date = os.environ.get("DATE")
if not old_date:
    print("DATE not set")
    exit(1)


CURRENT_DB_PATH = os.path.join(base_path, "web", "repos.db")
OLD_DB_PATH = os.path.join(base_path, "web", "repos-" + old_date + ".db")

# check if files exist
if not os.path.exists(CURRENT_DB_PATH):
    print("CURRENT_DB_PATH does not exist")
    exit(1)
if not os.path.exists(OLD_DB_PATH):
    print("OLD_DB_PATH does not exist")
    exit(1)

# in memory
conn = sqlite3.connect(':memory:')
cur = conn.cursor()
cur.execute("ATTACH DATABASE ? AS repos", (CURRENT_DB_PATH,))
cur.execute("ATTACH DATABASE ? AS oldrepos", (OLD_DB_PATH,))

# get table names
def get_tables(cur, db):
    cur.execute("SELECT name FROM "+db+".sqlite_master WHERE type='table'")
    tables = cur.fetchall()
    return [t[0] for t in tables]

# check if has flux_helm_release
if "flux_helm_release" not in get_tables(cur, "oldrepos"):
    print("flux_helm_release table not found in oldrepos", OLD_DB_PATH)
    exit(1)
if "flux_helm_release" not in get_tables(cur, "repos"):
    print("flux_helm_release table not found in repos", CURRENT_DB_PATH)
    exit(1)

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
old = get_count(cur, "oldrepos")

# calculate diff
diff = {}
for repo in current:
    if repo in old:
        diff[repo] = current[repo] - old[repo]

how_many = 15
top = sorted(diff.items(), key=lambda x: x[1], reverse=True)[:how_many]
bottom = sorted(diff.items(), key=lambda x: x[1])[:how_many]

first_column = len(old_date)
second_column = len('current')
third_column = len('release name')
extra = max(third_column, max(len(v[0]) for v in top))

l1 = '─'*(first_column+2)
l2 = '─'*(second_column+2)
l3 = '─'*(extra+2)

print("Top " + str(len(top)) + " added")
print("```")
print(f"┌{l1}┬{l2}┬{l3}┐")
print(f"| {old_date} | current | {'release name':<{extra}} |")
print(f"├{l1}┼{l2}┼{l3}┤")
for (k, v) in top:
    month_ago, cur = old[k], current[k]
    print(f"| {month_ago:<{first_column}} | {cur:<{second_column}} | {k:<{extra}} |")

print(f"└{l1}┴{l2}┴{l3}┘")
print("```")

print("")
print("Most " + str(len(bottom)) + " deleted")
extra = max(third_column, max(len(v[0]) for v in bottom))
l3 = '─'*(extra+2)
print("```")
print(f"┌{l1}┬{l2}┬{l3}┐")
print(f"| {old_date} | current | {'release name':<{extra}} |")
print(f"├{l1}┼{l2}┼{l3}┤")
for (k, v) in bottom:
    month_ago, cur = old[k], current[k]
    print(f"| {month_ago:<{first_column}} | {cur:<{second_column}} | {k:<{extra}} |")
print(f"└{l1}┴{l2}┴{l3}┘")
print("```")

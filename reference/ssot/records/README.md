# Forward Records

Store durable forward records here when they are neither decisions nor session/release logs—for example migration inventories, compatibility matrices, acceptance summaries, threat-model snapshots, data-shape inventories, or operational runbooks.

Records should be versioned or timestamped when their contents describe a point-in-time state. Current pointers should live in the parent SSOT layer rather than being silently embedded in old records.

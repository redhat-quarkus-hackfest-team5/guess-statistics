package quarkus.hackfest.data;

import org.infinispan.protostream.SerializationContextInitializer;
import org.infinispan.protostream.annotations.AutoProtoSchemaBuilder;

import quarkus.hackfest.datamodel.DriverStats;
import quarkus.hackfest.datamodel.Statistics;

@AutoProtoSchemaBuilder(includeClasses = { Statistics.class, DriverStats.class }, schemaPackageName = "quarkus.hackfest.datamodel")
interface GuessContextInitializer extends SerializationContextInitializer {
}

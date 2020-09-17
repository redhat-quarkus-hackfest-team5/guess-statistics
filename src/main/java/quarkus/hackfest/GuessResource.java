package quarkus.hackfest;

import java.util.Set;

import javax.inject.Inject;
import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import javax.ws.rs.core.Response.Status;

import org.infinispan.client.hotrod.RemoteCache;
import org.jboss.resteasy.annotations.jaxrs.PathParam;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import io.quarkus.infinispan.client.Remote;
import quarkus.hackfest.datamodel.Statistics;

@Path("/api")
public class GuessResource {
    private Logger log = LoggerFactory.getLogger(GuessResource.class);

    @Inject
    @Remote("statistics")
    RemoteCache<String, Statistics> stats;

    @GET
    @Path("/gp")
    @Produces(MediaType.APPLICATION_JSON)
    public Response list() {
        log.info("Starting datagrid access...");
        Set<String> keys = stats.keySet();
        log.info("Keys returned {}...", keys);
        return Response.ok(keys).build();
    }

    @GET
    @Path("/gp/{gp}")
    @Produces(MediaType.APPLICATION_JSON)
    public Response get(@PathParam String gp) {
        log.info("Starting datagrid access...");
        Statistics statistics = stats.get(gp);
        log.info("Statistics returned {}", statistics);

        if (statistics != null)
            return Response.ok(statistics).build();
        else
            return Response.status(Status.NOT_FOUND).build();
    }
}
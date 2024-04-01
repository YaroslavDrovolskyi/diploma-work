package ua.drovolskyi.scrum_system.backend;

import java.time.Clock;
import java.time.Instant;
import java.time.ZoneId;

public class Utils {
//    private static Clock clock = Clock.systemDefaultZone();
    private static Clock clock = Clock.tickSeconds(ZoneId.systemDefault());

    public static String toStringOrNull(Object o){
        if(o != null){
            return o.toString();
        }
        return "NULL";
    }

    /**
     * Changes clock used to get current timestamp. Can be useful in testing/manual actions with data
     * @param newClock
     */
    public static void setClock(Clock newClock){
        clock = newClock;
    }

    /**
     * Method to get current timestamp using clock. Default clock is .systemUTC(), but yoy can change it
     * Only this one should be used for getting current timestamp instead of LocalDateTime.now().
     * This will set time precision of system to seconds in order
     * to be synchronized with DB that has the same time precision
     * @return current timestamp truncated to seconds
     */
    public static Instant getCurrentTimestamp(){
        return Instant.now(clock);
    }

}

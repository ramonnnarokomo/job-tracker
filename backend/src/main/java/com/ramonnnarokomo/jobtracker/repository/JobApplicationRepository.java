package com.ramonnnarokomo.jobtracker.repository;

import com.ramonnnarokomo.jobtracker.domain.ApplicationStatus;
import com.ramonnnarokomo.jobtracker.domain.JobApplication;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface JobApplicationRepository extends JpaRepository<JobApplication, Long> {

    /**
     * Optional filters: a null {@code status} means any status, and an empty {@code text}
     * matches everything (it is searched in company and position, ignoring case).
     */
    @Query("""
            select a from JobApplication a
            where (:status is null or a.status = :status)
              and (lower(a.company) like concat('%', lower(:text), '%')
                   or lower(a.position) like concat('%', lower(:text), '%'))
            order by a.updatedAt desc, a.id desc
            """)
    List<JobApplication> search(@Param("status") ApplicationStatus status, @Param("text") String text);

    /** Loads the history in the same query, for the stats (avoids one query per application). */
    @Query("select distinct a from JobApplication a left join fetch a.history")
    List<JobApplication> findAllWithHistory();
}

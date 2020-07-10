import React from 'react';
import { Card, Grid, KeyValuePair, Page } from '@janus.team/janus-particles';

export const CardViewSkeleton = () => {
  return (
    <React.Fragment>
      <Page.MainHeader title="VMware Cloud Organizations" />
      <Page.MainBody>
        <Page.MainBodySection>
          <Grid withGutters>
            {[1, 2, 3, 4, 5].map(skeleton => (
              <Grid.Cell xs={12} sm={6} md={4} verticalGutter key={skeleton}>
                <Card header={'Header'} inGrid={true} className="goss-utility_skeleton">
                  <KeyValuePair vertical>
                    <span>Organization ID</span>
                    <span>Organization ID</span>
                  </KeyValuePair>
                  <KeyValuePair vertical>
                    <span>Service Blocks</span>
                    <span>Platform Essentials</span>
                  </KeyValuePair>
                </Card>
              </Grid.Cell>
            ))}
          </Grid>
        </Page.MainBodySection>
      </Page.MainBody>
    </React.Fragment>
  );
};
